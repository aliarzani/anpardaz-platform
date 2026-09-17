BEGIN;

INSERT INTO market_data_sources(name,base_url,enabled,priority,timeout_ms) VALUES
('wallex','https://api.wallex.ir',TRUE,10,5000),
('nobitex','https://api.nobitex.ir',TRUE,20,5000),
('tabdeal','https://api1.tabdeal.org',TRUE,30,5000)
ON CONFLICT(name) DO UPDATE SET base_url=EXCLUDED.base_url,priority=EXCLUDED.priority,timeout_ms=EXCLUDED.timeout_ms,updated_at=NOW();

INSERT INTO market_data_symbols(symbol,base_asset,quote_asset,enabled) VALUES
('BTC-USDT','BTC','USDT',TRUE),('ETH-USDT','ETH','USDT',TRUE),('BTC-IRT','BTC','IRT',TRUE),('ETH-IRT','ETH','IRT',TRUE),('USDT-IRT','USDT','IRT',TRUE)
ON CONFLICT(symbol) DO UPDATE SET base_asset=EXCLUDED.base_asset,quote_asset=EXCLUDED.quote_asset,enabled=EXCLUDED.enabled;

INSERT INTO schema_migrations(version) VALUES('017_market_data_bootstrap') ON CONFLICT(version) DO NOTHING;
COMMIT;
