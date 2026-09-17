import { createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Pool } from 'pg';

const scrypt = promisify(scryptCallback);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be set and at least 32 characters long');
const TOKEN_TTL_SECONDS = 60 * 60;

type Claims = { sub: string; role: string; service: 'anpardaz'; exp: number };
type AuthBody = { email?: string; password?: string };

const b64 = (value: string | Buffer) => Buffer.from(value).toString('base64url');
const sign = (input: string) => createHmac('sha256', JWT_SECRET).update(input).digest('base64url');

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString('base64url')}`;
}

async function verifyPassword(password: string, stored: string) {
  const [, salt, encoded] = stored.split('$');
  if (!salt || !encoded) return false;
  const expected = Buffer.from(encoded, 'base64url');
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function createToken(claims: Claims) {
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64(JSON.stringify(claims));
  return `${header}.${payload}.${sign(`${header}.${payload}`)}`;
}

function verifyToken(token: string): Claims | null {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  const expected = sign(`${header}.${payload}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Claims;
    if (claims.service !== 'anpardaz' || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch { return null; }
}

const validBody = (body: AuthBody): body is Required<AuthBody> =>
  typeof body.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) &&
  typeof body.password === 'string' && body.password.length >= 10 && body.password.length <= 128;

export function registerAuthRoutes(app: { post: Function }, pool: Pool) {
  app.post('/api/v1/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body ?? {}) as AuthBody;
    if (!validBody(body)) return reply.code(400).send({ error: 'invalid_credentials' });
    const email = body.email.trim().toLowerCase();
    const passwordHash = await hashPassword(body.password);
    try {
      const result = await pool.query<{ id: string; role: string }>(
        `INSERT INTO customers (external_user_id, email, password_hash) VALUES ($1,$2,$3) RETURNING id, role`,
        [randomUUID(), email, passwordHash],
      );
      const user = result.rows[0];
      const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
      return reply.code(201).send({ accessToken: createToken({ sub: user.id, role: user.role, service: 'anpardaz', exp }), expiresIn: TOKEN_TTL_SECONDS });
    } catch (error: any) {
      if (error?.code === '23505') return reply.code(409).send({ error: 'email_already_registered' });
      request.log.error(error);
      return reply.code(500).send({ error: 'registration_failed' });
    }
  });

  app.post('/api/v1/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = (request.body ?? {}) as AuthBody;
    if (!validBody(body)) return reply.code(400).send({ error: 'invalid_credentials' });
    const result = await pool.query<{ id: string; password_hash: string; role: string; status: string }>(
      `SELECT id, password_hash, role, status FROM customers WHERE LOWER(email)=LOWER($1) LIMIT 1`, [body.email.trim()]);
    const user = result.rows[0];
    if (!user?.password_hash || user.status !== 'active' || !(await verifyPassword(body.password, user.password_hash)))
      return reply.code(401).send({ error: 'invalid_credentials' });
    await pool.query('UPDATE customers SET last_login_at=NOW() WHERE id=$1', [user.id]);
    const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    return { accessToken: createToken({ sub: user.id, role: user.role, service: 'anpardaz', exp }), expiresIn: TOKEN_TTL_SECONDS };
  });
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  const claims = header?.startsWith('Bearer ') ? verifyToken(header.slice(7)) : null;
  if (!claims) return reply.code(401).send({ error: 'unauthorized' });
  (request as FastifyRequest & { auth: Claims }).auth = claims;
}
