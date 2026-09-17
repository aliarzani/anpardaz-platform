BEGIN;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_customer_idempotency ON orders(customer_id,idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status_created ON withdrawals(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_status_created ON deposits(status,created_at DESC);
INSERT INTO schema_migrations(version) VALUES('006_trading_safety') ON CONFLICT(version) DO NOTHING;
COMMIT;
