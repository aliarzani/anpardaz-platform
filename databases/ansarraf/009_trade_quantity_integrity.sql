BEGIN;

CREATE OR REPLACE FUNCTION validate_trade_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  order_quantity NUMERIC(36,18);
  filled_quantity NUMERIC(36,18);
BEGIN
  SELECT quantity INTO order_quantity
  FROM orders
  WHERE id=NEW.order_id
  FOR UPDATE;

  IF order_quantity IS NULL THEN
    RAISE EXCEPTION 'trade_order_not_found';
  END IF;

  SELECT COALESCE(SUM(quantity),0) INTO filled_quantity
  FROM trades
  WHERE order_id=NEW.order_id
    AND id<>NEW.id;

  IF filled_quantity + NEW.quantity > order_quantity THEN
    RAISE EXCEPTION 'trade_quantity_exceeds_order';
  END IF;

  IF NEW.fee_asset_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM assets
       WHERE id=NEW.fee_asset_id
         AND status='active'
     ) THEN
    RAISE EXCEPTION 'fee_asset_disabled';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_trade_integrity ON trades;
CREATE TRIGGER trg_trade_integrity
BEFORE INSERT OR UPDATE ON trades
FOR EACH ROW EXECUTE FUNCTION validate_trade_integrity();

CREATE INDEX IF NOT EXISTS idx_trades_order_created
  ON trades(order_id, created_at DESC);

INSERT INTO schema_migrations(version)
VALUES ('009_trade_quantity_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
