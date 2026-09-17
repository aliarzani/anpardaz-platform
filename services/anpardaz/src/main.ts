import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 4001);
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',').map((value) => value.trim()) ?? true,
});

app.get('/health', async () => ({ service: 'anpardaz', status: 'ok' }));

app.get('/health/db', async (_request, reply) => {
  if (!pool) return reply.code(503).send({ service: 'anpardaz', database: 'not-configured' });
  try {
    await pool.query('SELECT 1');
    return { service: 'anpardaz', database: 'ok' };
  } catch {
    return reply.code(503).send({ service: 'anpardaz', database: 'unavailable' });
  }
});

app.get('/api/v1/status', async () => ({
  service: 'anpardaz',
  apiVersion: 'v1',
  status: 'ready',
}));

const shutdown = async () => {
  await app.close();
  await pool?.end();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

await app.listen({ host: '0.0.0.0', port });
