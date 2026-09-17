import { createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Pool } from 'pg';

const scrypt=promisify(scryptCallback); const JWT_SECRET=process.env.JWT_SECRET;
if(!JWT_SECRET||JWT_SECRET.length<32)throw new Error('JWT_SECRET must be set and at least 32 characters long');
const TTL=3600; type Claims={sub:string;role:string;service:'platform';exp:number}; type Body={email?:string;password?:string};
const b64=(v:string|Buffer)=>Buffer.from(v).toString('base64url'); const sign=(v:string)=>createHmac('sha256',JWT_SECRET).update(v).digest('base64url');
async function hash(p:string){const s=randomBytes(16).toString('base64url');const d=(await scrypt(p,s,64)) as Buffer;return `scrypt$${s}$${d.toString('base64url')}`;}
async function check(p:string,x:string){const[,s,e]=x.split('$');if(!s||!e)return false;const a=Buffer.from(e,'base64url');const b=(await scrypt(p,s,a.length)) as Buffer;return a.length===b.length&&timingSafeEqual(a,b);}
function token(c:Claims){const h=b64(JSON.stringify({alg:'HS256',typ:'JWT'})),p=b64(JSON.stringify(c));return `${h}.${p}.${sign(`${h}.${p}`)}`;}
function verify(t:string):Claims|null{const[h,p,s]=t.split('.');if(!h||!p||!s)return null;const e=sign(`${h}.${p}`),a=Buffer.from(s),b=Buffer.from(e);if(a.length!==b.length||!timingSafeEqual(a,b))return null;try{const c=JSON.parse(Buffer.from(p,'base64url').toString()) as Claims;return c.service==='platform'&&c.exp>Math.floor(Date.now()/1000)?c:null;}catch{return null;}}
const valid=(b:Body):b is Required<Body>=>typeof b.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)&&typeof b.password==='string'&&b.password.length>=10&&b.password.length<=128;
export function registerAuthRoutes(app:{post:Function},pool:Pool){
 app.post('/api/v1/auth/register',async(req:FastifyRequest,reply:FastifyReply)=>{const b=(req.body??{}) as Body;if(!valid(b))return reply.code(400).send({error:'invalid_credentials'});try{const r=await pool.query<{id:string;role:string}>(`INSERT INTO platform_users(external_user_id,email,password_hash) VALUES($1,$2,$3) RETURNING id,role`,[randomUUID(),b.email.trim().toLowerCase(),await hash(b.password)]);const exp=Math.floor(Date.now()/1000)+TTL;return reply.code(201).send({accessToken:token({sub:r.rows[0].id,role:r.rows[0].role,service:'platform',exp}),expiresIn:TTL});}catch(e:any){if(e?.code==='23505')return reply.code(409).send({error:'email_already_registered'});req.log.error(e);return reply.code(500).send({error:'registration_failed'});}});
 app.post('/api/v1/auth/login',async(req:FastifyRequest,reply:FastifyReply)=>{const b=(req.body??{}) as Body;if(!valid(b))return reply.code(400).send({error:'invalid_credentials'});const r=await pool.query<{id:string;password_hash:string;role:string;status:string}>(`SELECT id,password_hash,role,status FROM platform_users WHERE LOWER(email)=LOWER($1) LIMIT 1`,[b.email.trim()]);const u=r.rows[0];if(!u?.password_hash||u.status!=='active'||!(await check(b.password,u.password_hash)))return reply.code(401).send({error:'invalid_credentials'});await pool.query('UPDATE platform_users SET last_login_at=NOW() WHERE id=$1',[u.id]);const exp=Math.floor(Date.now()/1000)+TTL;return {accessToken:token({sub:u.id,role:u.role,service:'platform',exp}),expiresIn:TTL};});
}
export async function requireAuth(req:FastifyRequest,reply:FastifyReply){const h=req.headers.authorization;const c=h?.startsWith('Bearer ')?verify(h.slice(7)):null;if(!c)return reply.code(401).send({error:'unauthorized'});(req as FastifyRequest&{auth:Claims}).auth=c;}
