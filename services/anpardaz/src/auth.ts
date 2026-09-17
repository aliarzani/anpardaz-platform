import { createPublicKey, FastifyRequest, FastifyReply } from 'node:crypto';
import { verify as verifyData } from 'node:crypto';
import type { Pool } from 'pg';

type Claims={sub:string;email:string;role:string;iss:string;aud:'anpardaz-ecosystem';iat:number;exp:number};
const PUBLIC_KEY_B64=process.env.IDENTITY_PUBLIC_KEY_B64; if(!PUBLIC_KEY_B64)throw new Error('IDENTITY_PUBLIC_KEY_B64 must be configured');
const publicKey=createPublicKey({key:Buffer.from(PUBLIC_KEY_B64,'base64'),format:'der',type:'spki'});
const identityUrl=()=> (process.env.IDENTITY_SERVICE_URL??'http://localhost:4003').replace(/\/$/,'');
export async function identityRequest(path:string,body:unknown){const r=await fetch(`${identityUrl()}${path}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const data=await r.json();return {status:r.status,data};}
export function verifyIdentityToken(t:string):Claims|null{const[h,p,s]=t.split('.');if(!h||!p||!s)return null;try{if(!verifyData(null,Buffer.from(`${h}.${p}`),publicKey,Buffer.from(s,'base64url')))return null;const c=JSON.parse(Buffer.from(p,'base64url').toString()) as Claims;if(c.aud!=='anpardaz-ecosystem'||c.iss!==(process.env.IDENTITY_ISSUER??'anpardaz-platform')||c.exp<=Math.floor(Date.now()/1000))return null;return c;}catch{return null;}}
export async function requireAuth(req:FastifyRequest,reply:FastifyReply){const h=req.headers.authorization;const c=h?.startsWith('Bearer ')?verifyIdentityToken(h.slice(7)):null;if(!c)return reply.code(401).send({error:'unauthorized'});(req as FastifyRequest&{auth:Claims}).auth=c;}
export async function ensureCustomer(pool:Pool,auth:Claims){const existing=await pool.query<{id:string}>('SELECT id FROM customers WHERE identity_id=$1 LIMIT 1',[auth.sub]);if(existing.rows[0])return existing.rows[0].id;const r=await pool.query<{id:string}>('INSERT INTO customers(identity_id,external_user_id,email) VALUES($1,$1,$2) ON CONFLICT(identity_id) DO UPDATE SET email=EXCLUDED.email RETURNING id',[auth.sub,auth.email]);return r.rows[0].id;}
export type AuthClaims=Claims;
