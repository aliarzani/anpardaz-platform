import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 4003);
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',').map((value) => value.trim()) ?? true,
});

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

app.get('/api/v1/status', async () => ({
  service: 'platform',
  apiVersion: 'v1',
  status: 'ready',
}));

app.get('/api/v1/news', async () => {
  if (!pool) return { items: [] };

  const result = await pool.query<{
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    published_at: string | null;
  }>(`
    SELECT id, title, slug, summary, published_at
    FROM news_articles
    WHERE status = 'published'
    ORDER BY published_at DESC NULLS LAST, id DESC
    LIMIT 20
  `);

  return { items: result.rows };
});

const shutdown = async () => {
  await app.close();
  await pool?.end();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

await app.listen({ host: '0.0.0.0', port });
