BEGIN;

ALTER TABLE deposits ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_deposits_customer_idempotency
  ON deposits(customer_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_withdrawals_customer_idempotency
  ON withdrawals(customer_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assets_symbol_status ON assets(symbol, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_status_created ON deposits(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status_created ON withdrawals(status, created_at DESC);

CREATE OR REPLACE FUNCTION validate_order_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.base_asset_id=NEW.quote_asset_id THEN
    RAISE EXCEPTION 'order_assets_must_differ';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM assets WHERE id=NEW.base_asset_id AND status='active')
     OR NOT EXISTS (SELECT 1 FROM assets WHERE id=NEW.quote_asset_id AND status='active') THEN
    RAISE EXCEPTION 'order_asset_disabled';
  END IF;
  IF NEW.order_type='market' AND NEW.price IS NOT NULL THEN
    RAISE EXCEPTION 'market_order_price_must_be_null';
  END IF;
  IF NEW.order_type='limit' AND NEW.price IS NULL THEN
    RAISE EXCEPTION 'limit_order_price_required';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_order_integrity ON orders;
CREATE TRIGGER trg_order_integrity
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION validate_order_integrity();

CREATE OR REPLACE FUNCTION validate_exchange_request_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM assets WHERE id=NEW.asset_id AND status='active') THEN
    RAISE EXCEPTION 'asset_disabled';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_deposit_integrity ON deposits;
CREATE TRIGGER trg_deposit_integrity
BEFORE INSERT OR UPDATE ON deposits
FOR EACH ROW EXECUTE FUNCTION validate_exchange_request_integrity();

DROP TRIGGER IF EXISTS trg_withdrawal_integrity ON withdrawals;
CREATE TRIGGER trg_withdrawal_integrity
BEFORE INSERT OR UPDATE ON withdrawals
FOR EACH ROW EXECUTE FUNCTION validate_exchange_request_integrity();

INSERT INTO schema_migrations(version)
VALUES ('007_trading_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
