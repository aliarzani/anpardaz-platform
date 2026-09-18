import {Pool} from 'pg';
import {AiGateway} from '../services/ai-gateway.js';

const databaseUrl=process.env.DATABASE_URL;
if(!databaseUrl)throw new Error('DATABASE_URL must be configured');
const pool=new Pool({connectionString:databaseUrl,max:4,connectionTimeoutMillis:5000,idleTimeoutMillis:30000});
const gateway=new AiGateway(pool);
const intervalMs=Math.max(1000,Number(process.env.HOOSH_WORKER_INTERVAL_MS??1000));
const enabled=process.env.HOOSH_WORKER_ENABLED==='true';

async function claim(){
 const c=await pool.connect();
 try{
  await c.query('BEGIN');
  await c.query("UPDATE hoosh_requests SET status='queued',started_at=NULL WHERE status='running' AND started_at < NOW() - INTERVAL '10 minutes'");
  const q=await c.query<any>("SELECT id,identity_id,conversation_id,request_text,model FROM hoosh_requests WHERE status='queued' ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1");
  if(!q.rows[0]){await c.query('ROLLBACK');return null;}
  const r=q.rows[0];
  await c.query("UPDATE hoosh_requests SET status='running',started_at=NOW() WHERE id=$1",[r.id]);
  await c.query('COMMIT');
  return r;
 }catch(e){await c.query('ROLLBACK').catch(()=>{});throw e;}finally{c.release();}
}

async function processOne(){
 const r=await claim();
 if(!r)return false;
 try{
  const result=await gateway.execute({workflowCode:'hoosh.chat',input:r.request_text,requesterIdentityId:r.identity_id,sourceType:'hoosh_request',sourceId:String(r.id)});
  const c=await pool.connect();
  try{
   await c.query('BEGIN');
   await c.query('INSERT INTO hoosh_messages(conversation_id,role,content,metadata) VALUES($1,\'assistant\',$2,$3)',[r.conversation_id,result.text,JSON.stringify({provider:result.provider,model:result.model,requestId:r.id})]);
   await c.query('INSERT INTO hoosh_usage(identity_id,conversation_id,provider,model,input_tokens,output_tokens,cost,status) VALUES($1,$2,$3,$4,$5,$6,$7,\'completed\')',[r.identity_id,r.conversation_id,result.provider,result.model,result.inputTokens,result.outputTokens,result.cost]);
   await c.query("UPDATE hoosh_requests SET status='completed',provider=$1,model=$2,completed_at=NOW(),started_at=NULL,error=NULL WHERE id=$3",[result.provider,result.model,r.id]);
   await c.query('UPDATE hoosh_conversations SET updated_at=NOW() WHERE id=$1',[r.conversation_id]);
   await c.query('COMMIT');
  }catch(e){await c.query('ROLLBACK').catch(()=>{});throw e;}finally{c.release();}
 }catch(e){
  await pool.query("UPDATE hoosh_requests SET status='failed',error=$1,completed_at=NOW(),started_at=NULL WHERE id=$2",[e instanceof Error?e.message:'AI_EXECUTION_FAILED',r.id]);
 }
 return true;
}

if(!enabled)console.log('An Hoosh worker disabled; set HOOSH_WORKER_ENABLED=true to enable');
else{
 console.log(`An Hoosh worker started; interval=${intervalMs}ms`);
 const tick=async()=>{try{while(await processOne()){} }catch(e){console.error(e);}};
 await tick();
 const timer=setInterval(tick,intervalMs);
 const shutdown=async()=>{clearInterval(timer);await pool.end();process.exit(0);};
 process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
}
