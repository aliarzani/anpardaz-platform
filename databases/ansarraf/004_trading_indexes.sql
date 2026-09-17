BEGIN;

CREATE INDEX IF NOT EXISTS idx_wallets_customer_asset ON wallets(customer_id, asset_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_base_quote_status_created ON orders(base_asset_id, quote_asset_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_order_created ON trades(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_customer_created ON deposits(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_customer_created ON withdrawals(customer_id, created_at DESC);

INSERT INTO schema_migrations (version)
VALUES ('004_trading_indexes')
ON CONFLICT (version) DO NOTHING;

COMMIT;
