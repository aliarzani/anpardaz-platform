import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Pool } from 'pg';
import { requireAuth } from '../auth.js';

type Params = { id: string };
type CreateAccount = { accountType?: 'wallet'|'bank'|'settlement'; currency?: string };

export function registerAccountRoutes(app: FastifyInstance, pool: Pool) {
  app.get('/api/v1/accounts', { preHandler: requireAuth }, async (request) => {
    const auth=(request as FastifyRequest & {auth:{sub:string}}).auth;
    const result=await pool.query('SELECT id,account_type,currency,status,created_at FROM accounts WHERE customer_id=$1 ORDER BY created_at DESC',[auth.sub]);
    return { accounts: result.rows };
  });
  app.post<{Body:CreateAccount}>('/api/v1/accounts',{preHandler:requireAuth},async(request,reply)=>{
    const auth=(request as FastifyRequest & {auth:{sub:string}}).auth;
    const type=request.body?.accountType, currency=request.body?.currency?.trim().toUpperCase();
    if(!type||!currency||!/^[A-Z]{3}$/.test(currency))return reply.code(400).send({error:'invalid_account'});
    try{const r=await pool.query('INSERT INTO accounts(customer_id,account_type,currency) VALUES($1,$2,$3) RETURNING id,account_type,currency,status,created_at',[auth.sub,type,currency]);return reply.code(201).send({account:r.rows[0]});}
    catch(e:any){if(e?.code==='23505')return reply.code(409).send({error:'account_already_exists'});throw e;}
  });
  app.get<{Params:Params}>('/api/v1/accounts/:id/transactions',{preHandler:requireAuth},async(request,reply)=>{
    const auth=(request as FastifyRequest & {auth:{sub:string}}).auth; const id=Number(request.params.id); if(!Number.isSafeInteger(id))return reply.code(400).send({error:'invalid_account_id'});
    const owner=await pool.query('SELECT id FROM accounts WHERE id=$1 AND customer_id=$2',[id,auth.sub]); if(!owner.rows[0])return reply.code(404).send({error:'account_not_found'});
    const r=await pool.query('SELECT id,transaction_type,amount,currency,status,reference,description,created_at FROM transactions WHERE account_id=$1 ORDER BY created_at DESC LIMIT 100',[id]); return {transactions:r.rows};
  });
}
