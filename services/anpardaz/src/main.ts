import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';
import { registerAuthRoutes, requireAuth } from './auth.js';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 4001);
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 }) : null;
if (!pool) app.log.warn('DATABASE_URL is not configured; database endpoints will be unavailable');

await app.register(cors, { origin: process.env.CORS_ORIGIN?.split(',').map((value) => value.trim()) ?? true });
app.get('/health', async () => ({ service: 'anpardaz', status: 'ok' }));
app.get('/health/db', async (_request, reply) => {
  if (!pool) return reply.code(503).send({ service: 'anpardaz', database: 'not-configured' });
  try { const r=await pool.query<{version:string}>('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1'); return { service:'anpardaz', database:'ok', migration:r.rows[0]?.version??null }; }
  catch { return reply.code(503).send({ service:'anpardaz', database:'unavailable' }); }
});
app.get('/api/v1/status', async () => ({ service: 'anpardaz', apiVersion: 'v1', status: 'ready' }));
if (pool) {
  registerAuthRoutes(app, pool);
  app.get('/api/v1/auth/me', { preHandler: requireAuth }, async (request) => {
    const auth = (request as typeof request & { auth: { sub: string; role: string } }).auth;
    const r = await pool.query<{ id:string; email:string|null; role:string; status:string }>('SELECT id,email,role,status FROM customers WHERE id=$1', [auth.sub]);
    if (!r.rows[0]) return { error: 'user_not_found' };
    return { user: r.rows[0] };
  });
}
const shutdown = async () => { await app.close(); await pool?.end(); };
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
await app.listen({ host: '0.0.0.0', port });
