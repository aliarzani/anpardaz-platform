import type {FastifyInstance,FastifyRequest,FastifyReply} from 'fastify';
import {requireAuth} from '../auth.js';

type R=FastifyRequest&{auth:{sub:string;role:string}};const r=(x:FastifyRequest)=>x as R;
const staff=['admin','super_admin','operator'];
const deny=(p:FastifyReply)=>p.code(403).send({error:'forbidden'});

export function registerMarketDataRoutes(app:FastifyInstance,pool:Pool){
 app.get<{Querystring:{symbol?:string}}>('/api/v1/market-data/quotes',async(req)=>{const symbol=req.query.symbol?.trim().toUpperCase();const params:any[]=[];const where=symbol?(params.push(symbol),'WHERE s.symbol=$1'):'';const q=await pool.query(`WITH latest AS (SELECT DISTINCT ON (o.symbol_id,o.source_id) o.symbol_id,o.source_id,o.bid,o.ask,o.last_price,o.received_at FROM market_data_observations o WHERE o.received_at>NOW()-INTERVAL '2 minutes' ORDER BY o.symbol_id,o.source_id,o.received_at DESC), usable AS (SELECT l.* FROM latest l JOIN market_data_health h ON h.source_id=l.source_id WHERE h.status IN ('healthy','degraded')) SELECT s.symbol,s.base_asset,s.quote_asset,percentile_cont(0.5) WITHIN GROUP (ORDER BY u.bid) FILTER(WHERE u.bid IS NOT NULL)::numeric(38,18)::text bid,percentile_cont(0.5) WITHIN GROUP (ORDER BY u.ask) FILTER(WHERE u.ask IS NOT NULL)::numeric(38,18)::text ask,percentile_cont(0.5) WITHIN GROUP (ORDER BY u.last_price) FILTER(WHERE u.last_price IS NOT NULL)::numeric(38,18)::text last_price,MAX(u.received_at) received_at,COUNT(DISTINCT u.source_id)::int source_count FROM market_data_symbols s LEFT JOIN usable u ON u.symbol_id=s.id ${where} GROUP BY s.id,s.symbol,s.base_asset,s.quote_asset ORDER BY s.symbol`,params);return{quotes:q.rows};});
 app.get('/api/v1/market-data/sources',{preHandler:requireAuth},async(req,reply)=>{if(!staff.includes(r(req).auth.role))return deny(reply);return{sources:(await pool.query('SELECT s.*,h.status,h.last_success_at,h.last_failure_at,h.consecutive_failures,h.last_error FROM market_data_sources s LEFT JOIN market_data_health h ON h.source_id=s.id ORDER BY s.priority,s.name')).rows};});
 app.get('/api/v1/market-data/symbols',async()=>({symbols:(await pool.query('SELECT id,symbol,base_asset,quote_asset,enabled FROM market_data_symbols ORDER BY symbol')).rows}));
}
