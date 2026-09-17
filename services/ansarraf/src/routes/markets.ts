import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Pool } from 'pg';
import { ensureCustomer, requireAuth } from '../auth.js';

type AuthenticatedRequest = FastifyRequest & { auth: { sub: string; email: string; role: string } };

export function registerMarketRoutes(app: FastifyInstance, pool: Pool) {
  app.get('/api/v1/assets', async () => {
    const r = await pool.query(
      "SELECT id,symbol,name,asset_type,decimals,status FROM assets WHERE status='active' ORDER BY symbol",
    );
    return { assets: r.rows };
  });

  app.get('/api/v1/wallets', { preHandler: requireAuth }, async (request) => {
    const auth = (request as AuthenticatedRequest).auth;
    const customerId = await ensureCustomer(pool, auth);
    const r = await pool.query(
      `SELECT w.id,w.asset_id,w.available_balance,w.locked_balance,w.created_at,a.symbol,a.name
       FROM wallets w
       JOIN assets a ON a.id=w.asset_id
       WHERE w.customer_id=$1
       ORDER BY a.symbol`,
      [customerId],
    );
    return { wallets: r.rows };
  });

  app.get('/api/v1/orders', { preHandler: requireAuth }, async (request) => {
    const auth = (request as AuthenticatedRequest).auth;
    const customerId = await ensureCustomer(pool, auth);
    const r = await pool.query(
      `SELECT id,base_asset_id,quote_asset_id,side,order_type,price,quantity,status,created_at
       FROM orders
       WHERE customer_id=$1
       ORDER BY created_at DESC
       LIMIT 100`,
      [customerId],
    );
    return { orders: r.rows };
  });
}
