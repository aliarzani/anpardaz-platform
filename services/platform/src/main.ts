import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

app.get('/health', async () => ({ service: 'platform', status: 'ok' }));

app.get('/health/db', async (_request, reply) => {
  if (!pool) return reply.code(503).send({ service: 'platform', database: 'not-configured' });
  try {
    await pool.query('SELECT 1');
    return { service: 'platform', database: 'ok' };
  } catch {
    return reply.code(503).send({ service: 'platform', database: 'unavailable' });
  }
});

const port = Number(process.env.PORT ?? 4003);
await app.listen({ host: '0.0.0.0', port });
