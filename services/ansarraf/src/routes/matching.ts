import type {FastifyInstance, FastifyRequest} from 'fastify';
import type {Pool} from 'pg';
import {createHash} from 'node:crypto';

const validId=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>0;

export function registerMatchingRoutes(app:FastifyInstance,pool:Pool){
  app.post('/internal/v1/orders/:id/match',async(req,reply)=>{
    const token=process.env.ANSARRAF_INTERNAL_TOKEN;
    if(!token||req.headers.authorization!==`Bearer ${token}`)return reply.code(401).send({error:'unauthorized'});
    const orderId=Number((req.params as {id:string}).id);
    if(!validId(orderId))return reply.code(400).send({error:'invalid_order_id'});

    const limitRaw=Number(((req.body??{}) as {maxTrades?:unknown}).maxTrades??20);
    const maxTrades=Math.min(Math.max(Number.isSafeInteger(limitRaw)?limitRaw:20,1),100);
    const orderQ=await pool.query(
      "SELECT id,customer_id,base_asset_id,quote_asset_id,side,order_type,quantity,price,status FROM orders WHERE id=$1",
      [orderId]
    );
    const order=orderQ.rows[0];
    if(!order)return reply.code(404).send({error:'order_not_found'});
    if(!['open','partially_filled'].includes(order.status))return reply.code(409).send({error:'order_not_matchable'});

    const trades=[];
    for(let i=0;i<maxTrades;i++){
      const current=await pool.query(
        "SELECT id,customer_id,base_asset_id,quote_asset_id,side,order_type,quantity,price,status FROM orders WHERE id=$1",
        [orderId]
      );
      const taker=current.rows[0];
      if(!taker||!['open','partially_filled'].includes(taker.status))break;

      const candidate=await pool.query(
        `SELECT o.id,o.customer_id,o.base_asset_id,o.quote_asset_id,o.side,o.order_type,o.quantity,o.price,o.status
         FROM orders o
         WHERE o.id<>$1
           AND o.base_asset_id=$2 AND o.quote_asset_id=$3
           AND o.side=$4
           AND o.order_type='limit'
           AND o.status IN ('open','partially_filled')
           AND (
             ($4='sell' AND ( $5='market' OR o.price <= $6 ))
             OR
             ($4='buy'  AND ( $5='market' OR o.price >= $6 ))
           )
         ORDER BY
           CASE WHEN $4='sell' THEN o.price END ASC,
           CASE WHEN $4='buy' THEN o.price END DESC,
           o.created_at ASC,
           o.id ASC
         LIMIT 1`,
        [orderId,taker.base_asset_id,taker.quote_asset_id,taker.side==='buy'?'sell':'buy',taker.order_type,taker.price]
      );
      const maker=candidate.rows[0];
      if(!maker)break;
      if(maker.customer_id===taker.customer_id)break;

      const remainingQ=await pool.query(
        "SELECT ($1::numeric-COALESCE(SUM(quantity),0))::text AS remaining FROM trades WHERE order_id=$2",
        [taker.quantity,taker.id]
      );
      const makerRemainingQ=await pool.query(
        "SELECT ($1::numeric-COALESCE(SUM(quantity),0))::text AS remaining FROM trades WHERE order_id=$2",
        [maker.quantity,maker.id]
      );
      const amounts=await pool.query(
        "SELECT LEAST($1::numeric,$2::numeric)::text AS quantity",
        [remainingQ.rows[0].remaining,makerRemainingQ.rows[0].remaining]
      );
      const quantity=amounts.rows[0].quantity;
      if(!quantity||quantity==='0')break;

      // Execution price is the maker's resting limit price.
      const price=String(maker.price);
      const key=createHash('sha256').update(`match:${taker.id}:${maker.id}:${quantity}:${price}`).digest('hex');

      const injected=await app.inject({
        method:'POST',
        url:'/internal/v1/trades/settle',
        headers:{authorization:`Bearer ${token}`},
        payload:{orderId:taker.id,counterpartyOrderId:maker.id,quantity,price,idempotencyKey:`matching:${key}`}
      });
      if(injected.statusCode===201||injected.statusCode===200){
        trades.push(injected.json().trade);
        continue;
      }
      // Settlement re-checks balances, reservations and order state atomically.
      // A transient race means this candidate is no longer executable; stop this pass.
      req.log.warn({orderId,makerId:maker.id,status:injected.statusCode},'matching candidate rejected by settlement');
      break;
    }

    return {orderId,trades,matchedCount:trades.length};
  });
}
