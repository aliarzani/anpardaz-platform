import type { Pool } from 'pg';

type Quote={symbol:string;bid?:string;ask?:string;lastPrice?:string;volume24h?:string;sourceTimestamp?:string};
export interface MarketDataAdapter{readonly name:string;fetchQuotes(symbols:string[]):Promise<Quote[]>;}

export class MarketDataService{
 constructor(private readonly pool:Pool,private readonly adapters:MarketDataAdapter[]){ }
 async ingest(symbols:string[]){
  const symbolsRows=await this.pool.query<{id:string;symbol:string}>('SELECT id,symbol FROM market_data_symbols WHERE enabled=true AND symbol=ANY($1)',[symbols]);
  const idBySymbol=new Map(symbolsRows.rows.map(x=>[x.symbol,x.id]));
  for(const adapter of this.adapters){
   const source=await this.pool.query<{id:string}>('SELECT id FROM market_data_sources WHERE name=$1 AND enabled=true',[adapter.name]);
   if(!source.rows[0])continue;
   try{
    const quotes=await adapter.fetchQuotes(symbols);
    for(const q of quotes){const sid=idBySymbol.get(q.symbol);if(!sid)continue;await this.pool.query('INSERT INTO market_data_observations(source_id,symbol_id,bid,ask,last_price,volume_24h,source_timestamp) VALUES($1,$2,$3,$4,$5,$6,$7)',[source.rows[0].id,sid,q.bid??null,q.ask??null,q.lastPrice??null,q.volume24h??null,q.sourceTimestamp??null]);}
    await this.pool.query("INSERT INTO market_data_health(source_id,status,last_success_at,consecutive_failures,last_error,updated_at) VALUES($1,'healthy',NOW(),0,NULL,NOW()) ON CONFLICT(source_id) DO UPDATE SET status='healthy',last_success_at=NOW(),consecutive_failures=0,last_error=NULL,updated_at=NOW()",[source.rows[0].id]);
   }catch(error){await this.pool.query("INSERT INTO market_data_health(source_id,status,last_failure_at,consecutive_failures,last_error,updated_at) VALUES($1,'degraded',NOW(),1,$2,NOW()) ON CONFLICT(source_id) DO UPDATE SET status=CASE WHEN market_data_health.consecutive_failures+1>=5 THEN 'down' ELSE 'degraded' END,last_failure_at=NOW(),consecutive_failures=market_data_health.consecutive_failures+1,last_error=$2,updated_at=NOW()",[source.rows[0].id,error instanceof Error?error.message:'market_data_error']);}
  }
 }
}
