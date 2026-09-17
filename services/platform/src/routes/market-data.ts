import type {FastifyInstance,FastifyRequest,FastifyReply} from 'fastify';
import type {Pool} from 'pg';
import {requireAuth} from '../auth.js';

type R=FastifyRequest&{auth:{sub:string;role:string}};
const r=(x:FastifyRequest)=>x as R;
const staff=['admin','super_admin','operator'];
const deny=(p:FastifyReply)=>p.code(403).send({error:'forbidden'});

export function registerMarketDataRoutes(app:FastifyInstance,pool:Pool){
 app.get<{Querystring:{symbol?:string}}>('/api/v1/market-data/quotes',async(req,reply)=>{const symbol=req.query.symbol?.trim().toUpperCase();const params:any[]=[];const where=symbol?(params.push(symbol),'WHERE s.symbol=$1'):'';const q=await pool.query(`SELECT s.symbol,s.base_asset,s.quote_asset,ROUND(AVG(o.bid),18)::text bid,ROUND(AVG(o.ask),18)::text ask,ROUND(AVG(o.last_price),18)::text last_price,MAX(o.received_at) received_at,COUNT(DISTINCT o.source_id)::int source_count FROM market_data_symbols s LEFT JOIN market_data_observations o ON o.symbol_id=s.id AND o.received_at>NOW()-INTERVAL '2 minutes' ${where} GROUP BY s.id,s.symbol,s.base_asset,s.quote_asset ORDER BY s.symbol`,params);return{quotes:q.rows};});
 app.get('/api/v1/market-data/sources',{preHandler:requireAuth},async(req,reply)=>{if(!staff.includes(r(req).auth.role))return deny(reply);return{sources:(await pool.query('SELECT s.*,h.status,h.last_success_at,h.last_failure_at,h.consecutive_failures,h.last_error FROM market_data_sources s LEFT JOIN market_data_health h ON h.source_id=s.id ORDER BY s.priority,s.name')).rows};});
 app.get('/api/v1/market-data/symbols',async()=>({symbols:(await pool.query('SELECT id,symbol,base_asset,quote_asset,enabled FROM market_data_symbols ORDER BY symbol')).rows}));
}
