import type {FastifyInstance,FastifyReply,FastifyRequest} from 'fastify';
import type {Pool} from 'pg';
import {requireAuth} from '../auth.js';
import {AiGateway} from '../services/ai-gateway.js';

type R=FastifyRequest&{auth:{sub:string;role:string}};const r=(x:FastifyRequest)=>x as R;
const staff=['admin','super_admin','operator','editor','moderator'];
export function registerAiRoutes(app:FastifyInstance,pool:Pool){const gateway=new AiGateway(pool);
 app.post('/api/v1/ai/execute',{preHandler:requireAuth},async(req,reply)=>{if(!staff.includes(r(req).auth.role))return reply.code(403).send({error:'forbidden'});const b=(req.body??{}) as any;if(typeof b.workflowCode!=='string'||b.workflowCode.length<2||b.workflowCode.length>100||typeof b.input!=='string'||!b.input.trim()||b.input.length>100000)return reply.code(400).send({error:'invalid_ai_request'});try{const result=await gateway.execute({workflowCode:b.workflowCode,input:b.input,requesterIdentityId:r(req).auth.sub,sourceType:b.sourceType,sourceId:b.sourceId});return{result};}catch(e){requestLog(req,e);return reply.code(502).send({error:'ai_provider_failure'});}});
 app.get('/api/v1/ai/runs',{preHandler:requireAuth},async(req,reply)=>{if(!staff.includes(r(req).auth.role))return reply.code(403).send({error:'forbidden'});const q=await pool.query('SELECT r.id,w.code workflow,p.name provider,r.status,r.model,r.input_tokens,r.output_tokens,r.cost,r.error_code,r.error_message,r.started_at,r.completed_at,r.created_at FROM ai_execution_runs r LEFT JOIN ai_workflows w ON w.id=r.workflow_id LEFT JOIN ai_providers p ON p.id=r.provider_id ORDER BY r.created_at DESC LIMIT 200');return{runs:q.rows};});
}
function requestLog(req:FastifyRequest,e:unknown){req.log.error(e,'ai_execution_failed');}
