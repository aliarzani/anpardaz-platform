BEGIN;

ALTER TABLE market_orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_market_orders_user_idempotency
  ON market_orders(user_id,idempotency_key)
  WHERE idempotency_key IS NOT NULL;

INSERT INTO schema_migrations(version)
VALUES ('027_market_order_idempotency')
ON CONFLICT(version) DO NOTHING;

COMMIT;
