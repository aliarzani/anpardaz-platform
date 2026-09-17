BEGIN;

INSERT INTO market_data_sources(name,base_url,enabled,priority,timeout_ms) VALUES
('wallex','https://api.wallex.ir',TRUE,10,5000),
('nobitex','https://api.nobitex.ir',TRUE,20,5000),
('tabdeal','https://api1.tabdeal.org',TRUE,30,5000)
ON CONFLICT(name) DO UPDATE SET base_url=EXCLUDED.base_url,enabled=EXCLUDED.enabled,priority=EXCLUDED.priority,timeout_ms=EXCLUDED.timeout_ms,updated_at=NOW();

INSERT INTO market_data_symbols(symbol,base_asset,quote_asset) VALUES
('BTC-USDT','BTC','USDT'),
('ETH-USDT','ETH','USDT'),
('BTC-IRT','BTC','IRT'),
('ETH-IRT','ETH','IRT')
ON CONFLICT(symbol) DO NOTHING;

INSERT INTO schema_migrations(version) VALUES('017_market_data_seed') ON CONFLICT(version) DO NOTHING;
COMMIT;
