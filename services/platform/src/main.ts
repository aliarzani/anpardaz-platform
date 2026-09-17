import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
app.get('/health', async () => ({ service: 'platform', status: 'ok' }));
const port = Number(process.env.PORT ?? 4003);
await app.listen({ host: '0.0.0.0', port });
