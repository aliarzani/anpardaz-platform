import type {FastifyInstance,FastifyRequest} from 'fastify';
import type {Pool} from 'pg';
import {createHash} from 'node:crypto';

const validId=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>0;
const amount=(v:unknown)=>typeof v==='string'&&/^(?:0|[1-9]\d{0,27})(?:\.\d{1,18})?$/.test(v)&&v!=='0'&&!/^0\.0+$/.test(v);
const idem=(v:unknown)=>typeof v==='string'&&v.length>=8&&v.length<=200;

export function registerSettlementRoutes(app:FastifyInstance,pool:Pool){
  app.post('/internal/v1/trades/settle',async(req,reply)=>{
    const token=process.env.ANSARRAF_INTERNAL_TOKEN;
    if(!token||req.headers.authorization!==`Bearer ${token}`)return reply.code(401).send({error:'unauthorized'});

    const b=(req.body??{}) as any;
    if(!validId(b.orderId)||!validId(b.counterpartyOrderId)||b.orderId===b.counterpartyOrderId||
       !amount(b.quantity)||!amount(b.price)||!idem(b.idempotencyKey)||
       (b.feeAmount!==undefined&&!amount(b.feeAmount))||
       (b.feeAssetId!==undefined&&!validId(b.feeAssetId)))
      return reply.code(400).send({error:'invalid_trade_settlement'});

    const client=await pool.connect();
    try{
      await client.query('BEGIN');

      const existing=await client.query(
        'SELECT * FROM trades WHERE settlement_idempotency_key=$1 FOR UPDATE',
        [b.idempotencyKey]
      );
      if(existing.rows[0]){
        await client.query('ROLLBACK');
        return {trade:existing.rows[0],idempotent:true};
      }

      // Lock orders in deterministic ID order to prevent buyer/seller deadlocks.
      const low=Math.min(b.orderId,b.counterpartyOrderId);
      const high=Math.max(b.orderId,b.counterpartyOrderId);
      const oq=await client.query(
        'SELECT * FROM orders WHERE id IN ($1,$2) ORDER BY id FOR UPDATE',
        [low,high]
      );
      if(oq.rows.length!==2)throw new Error('trade_order_not_found');

      const order=oq.rows.find((x:any)=>Number(x.id)===b.orderId);
      const other=oq.rows.find((x:any)=>Number(x.id)===b.counterpartyOrderId);
      if(!order||!other)throw new Error('trade_order_not_found');
      if(!['open','partially_filled'].includes(order.status)||!['open','partially_filled'].includes(other.status))
        throw new Error('trade_order_not_open');
      if(order.base_asset_id!==other.base_asset_id||order.quote_asset_id!==other.quote_asset_id||order.side===other.side)
        throw new Error('invalid_trade_counterparty');

      const filled=await client.query(
        'SELECT order_id,COALESCE(SUM(quantity),0)::text AS filled FROM trades WHERE order_id IN ($1,$2) GROUP BY order_id',
        [b.orderId,b.counterpartyOrderId]
      );
      const filledBy=new Map(filled.rows.map((x:any)=>[Number(x.order_id),x.filled]));
      const remaining=async(o:any)=>{
        const r=await client.query('SELECT ($1::numeric-COALESCE(SUM(quantity),0))::text AS remaining FROM trades WHERE order_id=$2',[o.quantity,o.id]);
        return r.rows[0].remaining;
      };
      const rem1=await remaining(order),rem2=await remaining(other);
      const q=String(b.quantity);
      if(Number(q)<=0||Number(q)>Number(rem1)||Number(q)>Number(rem2))throw new Error('trade_quantity_exceeds_remaining');

      if(order.order_type==='limit'&&Number(b.price)!==Number(order.price))throw new Error('trade_price_mismatch');
      if(other.order_type==='limit'&&Number(b.price)!==Number(other.price))throw new Error('trade_price_mismatch');

      const buyer=order.side==='buy'?order:other;
      const seller=order.side==='sell'?order:other;
      const feeAmount=b.feeAmount??'0';
      const feeAssetId=b.feeAssetId??null;
      if(feeAssetId!==null){
        const expected=buyer.base_asset_id;
        if(Number(feeAssetId)!==Number(expected))throw new Error('unsupported_fee_asset');
      }

      const quote=await client.query('SELECT ($1::numeric*$2::numeric)::text AS amount',[q,String(b.price)]);
      const quoteAmount=quote.rows[0].amount;

      const buyerRes=await client.query(
        'SELECT * FROM wallet_reservations WHERE order_id=$1 AND status=\'active\' FOR UPDATE',[buyer.id]
      );
      const sellerRes=await client.query(
        'SELECT * FROM wallet_reservations WHERE order_id=$1 AND status=\'active\' FOR UPDATE',[seller.id]
      );
      if(!buyerRes.rows[0]||!sellerRes.rows[0])throw new Error('wallet_reservation_missing');
      if(Number(buyerRes.rows[0].asset_id)!==Number(buyer.quote_asset_id))throw new Error('buyer_reservation_asset_mismatch');
      if(Number(sellerRes.rows[0].asset_id)!==Number(seller.base_asset_id))throw new Error('seller_reservation_asset_mismatch');

      // Lock both wallets deterministically.
      const walletIds=[Number(buyerRes.rows[0].wallet_id),Number(sellerRes.rows[0].wallet_id)].sort((a,b)=>a-b);
      const wq=await client.query('SELECT * FROM wallets WHERE id IN ($1,$2) ORDER BY id FOR UPDATE',[walletIds[0],walletIds[1]]);
      if(wq.rows.length!==2)throw new Error('settlement_wallet_not_found');

      const buyerWallet=wq.rows.find((x:any)=>Number(x.id)===Number(buyerRes.rows[0].wallet_id));
      const sellerWallet=wq.rows.find((x:any)=>Number(x.id)===Number(sellerRes.rows[0].wallet_id));
      if(!buyerWallet||!sellerWallet)throw new Error('settlement_wallet_not_found');

      const buyerRemaining=await client.query(
        'SELECT ($1::numeric-$2::numeric)::text AS remaining',[buyerRes.rows[0].amount,buyerRes.rows[0].consumed_amount]
      );
      const sellerRemaining=await client.query(
        'SELECT ($1::numeric-$2::numeric)::text AS remaining',[sellerRes.rows[0].amount,sellerRes.rows[0].consumed_amount]
      );
      if(Number(buyerRemaining.rows[0].remaining)<Number(quoteAmount))throw new Error('buyer_reservation_insufficient');
      if(Number(sellerRemaining.rows[0].remaining)<Number(q))throw new Error('seller_reservation_insufficient');

      // Consume locked quote from buyer and locked base from seller.
      const bw=await client.query(
        'UPDATE wallets SET locked_balance=locked_balance-$1 WHERE id=$2 AND locked_balance >= $1 RETURNING id',
        [quoteAmount,buyerWallet.id]
      );
      if(!bw.rows[0])throw new Error('buyer_locked_balance_invariant_failed');
      const sw=await client.query(
        'UPDATE wallets SET locked_balance=locked_balance-$1 WHERE id=$2 AND locked_balance >= $1 RETURNING id',
        [q,sellerWallet.id]
      );
      if(!sw.rows[0])throw new Error('seller_locked_balance_invariant_failed');

      // Deliver assets. Buy-side base fee is taken from the received base asset.
      const baseCredit=await client.query('SELECT ($1::numeric-$2::numeric)::text AS amount',[q,feeAssetId!==null?feeAmount:'0']);
      if(Number(baseCredit.rows[0].amount)<0)throw new Error('fee_exceeds_base_fill');

      const bcredit=await client.query(
        'UPDATE wallets SET available_balance=available_balance+$1 WHERE customer_id=$2 AND asset_id=$3 RETURNING id',
        [baseCredit.rows[0].amount,buyer.customer_id,buyer.base_asset_id]
      );
      if(!bcredit.rows[0]){
        await client.query('INSERT INTO wallets(customer_id,asset_id,available_balance) VALUES($1,$2,$3)',[buyer.customer_id,buyer.base_asset_id,baseCredit.rows[0].amount]);
      }
      const scredit=await client.query(
        'UPDATE wallets SET available_balance=available_balance+$1 WHERE customer_id=$2 AND asset_id=$3 RETURNING id',
        [quoteAmount,seller.customer_id,seller.quote_asset_id]
      );
      if(!scredit.rows[0]){
        await client.query('INSERT INTO wallets(customer_id,asset_id,available_balance) VALUES($1,$2,$3)',[seller.customer_id,seller.quote_asset_id,quoteAmount]);
      }

      const trade=await client.query(
        'INSERT INTO trades(order_id,counterparty_order_id,quantity,price,fee_amount,fee_asset_id,settlement_status,settlement_idempotency_key,settled_at) VALUES($1,$2,$3,$4,$5,$6,\'settled\',$7,NOW()) RETURNING *',
        [order.id,other.id,q,String(b.price),feeAmount,feeAssetId,b.idempotencyKey]
      );

      // Consume reservation portions. Fully consumed reservations are captured;
      // partially consumed reservations remain active.
      for(const x of [{r:buyerRes.rows[0],used:quoteAmount},{r:sellerRes.rows[0],used:q}]){
        const upd=await client.query(
          'UPDATE wallet_reservations SET consumed_amount=consumed_amount+$1,status=CASE WHEN consumed_amount+$1>=amount THEN \'captured\' ELSE \'active\' END,resolved_at=CASE WHEN consumed_amount+$1>=amount THEN NOW() ELSE NULL END WHERE id=$2 RETURNING *',
          [x.used,x.r.id]
        );
        if(!upd.rows[0])throw new Error('reservation_update_failed');
      }

      // Release any excess reservation when the corresponding order is now fully filled.
      for(const oid of [buyer.id,seller.id]){
        const or=await client.query('SELECT quantity FROM orders WHERE id=$1',[oid]);
        const fr=await client.query('SELECT COALESCE(SUM(quantity),0)::text AS filled FROM trades WHERE order_id=$1',[oid]);
        if(Number(fr.rows[0].filled)>=Number(or.rows[0].quantity)){
          const rr=await client.query('SELECT * FROM wallet_reservations WHERE order_id=$1 AND status=\'active\' FOR UPDATE',[oid]);
          if(rr.rows[0]){
            const unused=await client.query('SELECT (amount-consumed_amount)::text AS amount FROM wallet_reservations WHERE id=$1',[rr.rows[0].id]);
            if(Number(unused.rows[0].amount)>0){
              await client.query('UPDATE wallets SET locked_balance=locked_balance-$1,available_balance=available_balance+$1 WHERE id=$2 AND locked_balance >= $1',[unused.rows[0].amount,rr.rows[0].wallet_id]);
            }
            await client.query('UPDATE wallet_reservations SET status=\'released\',resolved_at=NOW() WHERE id=$1',[rr.rows[0].id]);
          }
          await client.query('UPDATE orders SET status=\'filled\',reserved_asset_id=NULL,reserved_amount=0 WHERE id=$1',[oid]);
        }else{
          await client.query('UPDATE orders SET status=\'partially_filled\' WHERE id=$1 AND status=\'open\'',[oid]);
          await client.query('UPDATE orders SET reserved_amount=(SELECT amount-consumed_amount FROM wallet_reservations WHERE order_id=$1 AND status=\'active\') WHERE id=$1',[oid]);
        }
      }

      await client.query('COMMIT');
      return reply.code(201).send({trade:trade.rows[0],idempotent:false});
    }catch(e:any){
      await client.query('ROLLBACK');
      req.log.error(e);
      return reply.code(400).send({error:e instanceof Error?e.message:'trade_settlement_failed'});
    }finally{client.release();}
  });
}