import { createPublicKey, verify as verifyData } from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Pool } from 'pg';

type Claims={sub:string;email:string;role:string;iss:string;aud:'anpardaz-ecosystem';iat:number;exp:number};
type AuthBody={email?:string;password?:string};
const PUBLIC_KEY_B64=process.env.IDENTITY_PUBLIC_KEY_B64;
if(!PUBLIC_KEY_B64)throw new Error('IDENTITY_PUBLIC_KEY_B64 must be configured');
const publicKey=createPublicKey({key:Buffer.from(PUBLIC_KEY_B64,'base64'),format:'der',type:'spki'});
const identityUrl=()=> (process.env.IDENTITY_SERVICE_URL??'http://localhost:4003').replace(/\/$/,'');
const valid=(b:AuthBody):b is Required<AuthBody>=>typeof b.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)&&typeof b.password==='string'&&b.password.length>=10&&b.password.length<=128;
export function verifyIdentityToken(t:string):Claims|null{const[h,p,s]=t.split('.');if(!h||!p||!s)return null;try{if(!verifyData(null,Buffer.from(`${h}.${p}`),publicKey,Buffer.from(s,'base64url')))return null;const c=JSON.parse(Buffer.from(p,'base64url').toString()) as Claims;if(c.aud!=='anpardaz-ecosystem'||c.iss!==(process.env.IDENTITY_ISSUER??'anpardaz-platform')||c.exp<=Math.floor(Date.now()/1000))return null;return c;}catch{return null;}}
export async function ensureCustomer(pool:Pool,auth:Claims){const existing=await pool.query<{id:string}>('SELECT id FROM customers WHERE identity_id=$1 LIMIT 1',[auth.sub]);if(existing.rows[0]){await pool.query('UPDATE customers SET email=$1 WHERE id=$2',[auth.email,existing.rows[0].id]);return existing.rows[0].id;}const r=await pool.query<{id:string}>('INSERT INTO customers(identity_id,external_user_id,email) VALUES($1,$1,$2) ON CONFLICT(identity_id) DO UPDATE SET email=EXCLUDED.email RETURNING id',[auth.sub,auth.email]);return r.rows[0].id;}
async function proxyAuth(action:string,body:Required<AuthBody>,req:FastifyRequest,reply:FastifyReply,pool:Pool){try{const r=await fetch(`${identityUrl()}/api/v1/auth/${action}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const data=await r.json() as {accessToken?:string;expiresIn?:number;error?:string};if(r.ok&&data.accessToken){const claims=verifyIdentityToken(data.accessToken);if(!claims)return reply.code(503).send({error:'invalid_identity_token'});await ensureCustomer(pool,claims);}return reply.code(r.status).send(data);}catch(e){req.log.error(e);return reply.code(503).send({error:'identity_service_unavailable'});}}
export function registerAuthRoutes(app:{post:Function},pool:Pool){for(const action of ['register','login'])app.post(`/api/v1/auth/${action}`,async(req:FastifyRequest,reply:FastifyReply)=>{const body=(req.body??{}) as AuthBody;if(!valid(body))return reply.code(400).send({error:'invalid_credentials'});return proxyAuth(action,body,req,reply,pool);});}
export async function requireAuth(req:FastifyRequest,reply:FastifyReply){const h=req.headers.authorization;const c=h?.startsWith('Bearer ')?verifyIdentityToken(h.slice(7)):null;if(!c)return reply.code(401).send({error:'unauthorized'});(req as FastifyRequest&{auth:Claims}).auth=c;}
export type AuthClaims=Claims;
