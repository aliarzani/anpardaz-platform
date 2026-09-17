import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Pool } from 'pg';
import { requireAuth } from '../auth.js';

type Req=FastifyRequest&{auth:{sub:string;role:string}};
const allowed=(r:Req)=>['admin','super_admin','operator'].includes(r.auth.role);
const deny=(reply:any)=>reply.code(403).send({error:'admin_required'});

export function registerAdminSettingsRoutes(app:FastifyInstance,pool:Pool){
 app.get('/api/v1/admin/settings',{preHandler:requireAuth},async(request,reply)=>{const r=request as Req;if(!allowed(r))return deny(reply);const rows=await pool.query('SELECT key,value,updated_at FROM platform_settings ORDER BY key');return{settings:rows.rows};});
 app.put('/api/v1/admin/settings/:key',{preHandler:requireAuth},async(request,reply)=>{const r=request as Req;if(!allowed(r))return deny(reply);const key=(request.params as {key:string}).key;const value=(request.body as {value?:unknown})?.value;if(!key||value===undefined)return reply.code(400).send({error:'invalid_setting'});const row=await pool.query('INSERT INTO platform_settings(key,value,updated_by) VALUES($1,$2,$3) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_by=EXCLUDED.updated_by,updated_at=NOW() RETURNING *',[key,value,await (async()=>{const u=await pool.query('SELECT id FROM platform_users WHERE identity_id=$1',[r.auth.sub]);return u.rows[0]?.id??null;})()]);return{setting:row.rows[0]};});
}
