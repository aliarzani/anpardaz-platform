import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Pool } from 'pg';
import { ensureCustomer, requireAuth, type AuthClaims } from '../auth.js';
import type { MarketDataService } from '../market-data.js';

type AuthenticatedRequest = FastifyRequest & { auth: AuthClaims };

export function registerMarketRoutes(app: FastifyInstance, pool: Pool, marketData?: MarketDataService | null) {
  app.get('/api/v1/assets', async () => {
    const r = await pool.query("SELECT id,symbol,name,asset_type,decimals,status FROM assets WHERE status='active' ORDER BY symbol");
    return { assets: r.rows };
  });
  app.get('/api/v1/market-data/quotes', async (request, reply) => {
    if (!marketData) return reply.code(503).send({ error: 'market_data_unavailable' });
    const symbol = (request.query as { symbol?: string }).symbol?.trim() || undefined;
    if (symbol && !/^[A-Z0-9]+\/[A-Z0-9]+$/.test(symbol)) return reply.code(400).send({ error: 'invalid_symbol' });
    return { quotes: await marketData.getQuotes(symbol) };
  });
  app.get('/api/v1/wallets', { preHandler: requireAuth }, async (request) => {
    const auth = (request as AuthenticatedRequest).auth;
    const customerId = await ensureCustomer(pool, auth);
    const r = await pool.query(`SELECT w.id,w.asset_id,w.available_balance,w.locked_balance,w.created_at,a.symbol,a.name FROM wallets w JOIN assets a ON a.id=w.asset_id WHERE w.customer_id=$1 ORDER BY a.symbol`, [customerId]);
    return { wallets: r.rows };
  });
}
