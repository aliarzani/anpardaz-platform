import type {FastifyInstance,FastifyRequest} from 'fastify';
import type {Pool} from 'pg';
import {requireAuth,type AuthClaims} from '../auth.js';
import {hasPermission} from '../permissions.js';

type R=FastifyRequest&{auth:AuthClaims};const r=(x:FastifyRequest)=>x as R;const deny=(reply:any)=>reply.code(403).send({error:'forbidden'});
const idem=(v:unknown)=>typeof v==='string'&&v.trim().length>=8&&v.trim().length<=200;
export function registerAiRoutes(app:FastifyInstance,pool:Pool){const gateway=new AiGateway(pool);
 app.post('/api/v1/ai/execute',{preHandler:requireAuth},async(req,reply)=>{const a=r(req);if(!(await hasPermission(pool,a.auth,'ai.execute')))return deny(reply);const b=(req.body??{}) as any;const header=req.headers['idempotency-key'];const idempotencyKey=Array.isArray(header)?header[0]:header;if(typeof b.workflowCode!=='string'||b.workflowCode.length<2||b.workflowCode.length>100||typeof b.input!=='string'||!b.input.trim()||b.input.length>20000||(idempotencyKey!==undefined&&!idem(idempotencyKey)))return reply.code(400).send({error:'invalid_ai_request'});try{const result=await gateway.execute({workflowCode:b.workflowCode,input:b.input,requesterIdentityId:a.auth.sub,sourceType:b.sourceType,sourceId:b.sourceId,idempotencyKey:typeof idempotencyKey==='string'?idempotencyKey.trim():undefined});return{result};}catch(e){requestLog(req,e);return reply.code(502).send({error:'ai_provider_failure'});}});
 app.get('/api/v1/ai/runs',{preHandler:requireAuth},async(req,reply)=>{const a=r(req);if(!(await hasPermission(pool,a.auth,'ai.runs.read')))return deny(reply);const q=await pool.query('SELECT r.id,w.code workflow,p.name provider,r.status,r.model,r.input_tokens,r.output_tokens,r.cost,r.error_code,r.error_message,r.started_at,r.completed_at,r.created_at FROM ai_execution_runs r LEFT JOIN ai_workflows w ON w.id=r.workflow_id LEFT JOIN ai_providers p ON p.id=r.provider_id ORDER BY r.created_at DESC LIMIT 200');return{runs:q.rows};});
}
function requestLog(req:FastifyRequest,e:unknown){req.log.error(e,'ai_execution_failed');}
