import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Pool } from 'pg';
import { requireAuth } from '../auth.js';

export function registerMarketRoutes(app: FastifyInstance, pool: Pool) {
  app.get('/api/v1/assets', async () => {
    const r=await pool.query('SELECT id,symbol,name,asset_type,decimals,status FROM assets WHERE status=\'active\' ORDER BY symbol');
    return { assets:r.rows };
  });
  app.get('/api/v1/wallets', { preHandler: requireAuth }, async (request) => {
    const auth=(request as FastifyRequest & {auth:{sub:string}}).auth;
    const r=await pool.query('SELECT w.id,w.asset_id,w.address,w.balance,w.available_balance,w.status,w.created_at,a.symbol,a.name FROM wallets w JOIN assets a ON a.id=w.asset_id JOIN customers c ON c.id=w.customer_id WHERE w.customer_id=$1 ORDER BY a.symbol',[auth.sub]);
    return { wallets:r.rows };
  });
  app.get('/api/v1/orders', { preHandler: requireAuth }, async (request) => {
    const auth=(request as FastifyRequest & {auth:{sub:string}}).auth;
    const r=await pool.query('SELECT id,asset_id,side,order_type,price,amount,filled_amount,status,created_at FROM orders WHERE customer_id=$1 ORDER BY created_at DESC LIMIT 100',[auth.sub]);
    return { orders:r.rows };
  });
}
