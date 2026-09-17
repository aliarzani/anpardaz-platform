import { createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Pool } from 'pg';

const scrypt = promisify(scryptCallback);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be set and at least 32 characters long');
const TOKEN_TTL_SECONDS = 60 * 60;
type Claims = { sub: string; role: string; service: 'ansarraf'; exp: number };
type AuthBody = { email?: string; password?: string };
const b64 = (value: string | Buffer) => Buffer.from(value).toString('base64url');
const sign = (input: string) => createHmac('sha256', JWT_SECRET).update(input).digest('base64url');
async function hashPassword(password: string) { const salt=randomBytes(16).toString('base64url'); const d=(await scrypt(password,salt,64)) as Buffer; return `scrypt$${salt}$${d.toString('base64url')}`; }
async function verifyPassword(password: string, stored: string) { const [,salt,encoded]=stored.split('$'); if(!salt||!encoded)return false; const expected=Buffer.from(encoded,'base64url'); const actual=(await scrypt(password,salt,expected.length)) as Buffer; return expected.length===actual.length&&timingSafeEqual(expected,actual); }
function createToken(c: Claims) { const h=b64(JSON.stringify({alg:'HS256',typ:'JWT'})); const p=b64(JSON.stringify(c)); return `${h}.${p}.${sign(`${h}.${p}`)}`; }
function verifyToken(token:string):Claims|null { const [h,p,s]=token.split('.'); if(!h||!p||!s)return null; const e=sign(`${h}.${p}`); const a=Buffer.from(s),b=Buffer.from(e); if(a.length!==b.length||!timingSafeEqual(a,b))return null; try{const c=JSON.parse(Buffer.from(p,'base64url').toString()) as Claims; return c.service==='ansarraf'&&c.exp>Math.floor(Date.now()/1000)?c:null;}catch{return null;} }
const valid=(b:AuthBody):b is Required<AuthBody> => typeof b.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)&&typeof b.password==='string'&&b.password.length>=10&&b.password.length<=128;
export function registerAuthRoutes(app:{post:Function},pool:Pool){
 app.post('/api/v1/auth/register',async(req:FastifyRequest,reply:FastifyReply)=>{const body=(req.body??{}) as AuthBody;if(!valid(body))return reply.code(400).send({error:'invalid_credentials'});try{const r=await pool.query<{id:string;role:string}>(`INSERT INTO customers(external_user_id,email,password_hash) VALUES($1,$2,$3) RETURNING id,role`,[randomUUID(),body.email.trim().toLowerCase(),await hashPassword(body.password)]);const exp=Math.floor(Date.now()/1000)+TOKEN_TTL_SECONDS;return reply.code(201).send({accessToken:createToken({sub:r.rows[0].id,role:r.rows[0].role,service:'ansarraf',exp}),expiresIn:TOKEN_TTL_SECONDS});}catch(e:any){if(e?.code==='23505')return reply.code(409).send({error:'email_already_registered'});req.log.error(e);return reply.code(500).send({error:'registration_failed'});}});
 app.post('/api/v1/auth/login',async(req:FastifyRequest,reply:FastifyReply)=>{const body=(req.body??{}) as AuthBody;if(!valid(body))return reply.code(400).send({error:'invalid_credentials'});const r=await pool.query<{id:string;password_hash:string;role:string;status:string}>(`SELECT id,password_hash,role,status FROM customers WHERE LOWER(email)=LOWER($1) LIMIT 1`,[body.email.trim()]);const u=r.rows[0];if(!u?.password_hash||u.status!=='active'||!(await verifyPassword(body.password,u.password_hash)))return reply.code(401).send({error:'invalid_credentials'});await pool.query('UPDATE customers SET last_login_at=NOW() WHERE id=$1',[u.id]);const exp=Math.floor(Date.now()/1000)+TOKEN_TTL_SECONDS;return {accessToken:createToken({sub:u.id,role:u.role,service:'ansarraf',exp}),expiresIn:TOKEN_TTL_SECONDS};});
}
export async function requireAuth(req:FastifyRequest,reply:FastifyReply){const h=req.headers.authorization;const c=h?.startsWith('Bearer ')?verifyToken(h.slice(7)):null;if(!c)return reply.code(401).send({error:'unauthorized'});(req as FastifyRequest&{auth:Claims}).auth=c;}
