BEGIN;

CREATE OR REPLACE FUNCTION validate_exchange_relationship_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  customer_status TEXT;
  asset_status TEXT;
  base_status TEXT;
  quote_status TEXT;
  order_status TEXT;
BEGIN
  IF TG_TABLE_NAME='wallets' THEN
    SELECT status INTO customer_status FROM customers WHERE id=NEW.customer_id;
    SELECT status INTO asset_status FROM assets WHERE id=NEW.asset_id;
    IF customer_status IS NULL OR customer_status<>'active' THEN
      RAISE EXCEPTION 'wallet_customer_not_active';
    END IF;
    IF asset_status IS NULL OR asset_status<>'active' THEN
      RAISE EXCEPTION 'wallet_asset_not_active';
    END IF;
  ELSIF TG_TABLE_NAME='orders' THEN
    SELECT status INTO customer_status FROM customers WHERE id=NEW.customer_id;
    SELECT status INTO base_status FROM assets WHERE id=NEW.base_asset_id;
    SELECT status INTO quote_status FROM assets WHERE id=NEW.quote_asset_id;
    IF customer_status IS NULL OR customer_status<>'active' THEN
      RAISE EXCEPTION 'order_customer_not_active';
    END IF;
    IF base_status IS NULL OR base_status<>'active' OR quote_status IS NULL OR quote_status<>'active' THEN
      RAISE EXCEPTION 'order_asset_not_active';
    END IF;
    IF NEW.order_type='limit' AND NEW.price IS NULL THEN
      RAISE EXCEPTION 'limit_order_price_required';
    END IF;
  ELSIF TG_TABLE_NAME IN ('deposits','withdrawals') THEN
    SELECT status INTO customer_status FROM customers WHERE id=NEW.customer_id;
    SELECT status INTO asset_status FROM assets WHERE id=NEW.asset_id;
    IF customer_status IS NULL OR customer_status<>'active' THEN
      RAISE EXCEPTION 'request_customer_not_active';
    END IF;
    IF asset_status IS NULL OR asset_status<>'active' THEN
      RAISE EXCEPTION 'request_asset_not_active';
    END IF;
  ELSIF TG_TABLE_NAME='trades' THEN
    SELECT status INTO order_status FROM orders WHERE id=NEW.order_id;
    IF order_status IS NULL OR order_status NOT IN ('open','partially_filled') THEN
      RAISE EXCEPTION 'trade_order_not_open';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_wallet_exchange_relationship ON wallets;
CREATE TRIGGER trg_wallet_exchange_relationship
BEFORE INSERT OR UPDATE ON wallets
FOR EACH ROW EXECUTE FUNCTION validate_exchange_relationship_integrity();

DROP TRIGGER IF EXISTS trg_order_exchange_relationship ON orders;
CREATE TRIGGER trg_order_exchange_relationship
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION validate_exchange_relationship_integrity();

DROP TRIGGER IF EXISTS trg_deposit_exchange_relationship ON deposits;
CREATE TRIGGER trg_deposit_exchange_relationship
BEFORE INSERT OR UPDATE ON deposits
FOR EACH ROW EXECUTE FUNCTION validate_exchange_relationship_integrity();

DROP TRIGGER IF EXISTS trg_withdrawal_exchange_relationship ON withdrawals;
CREATE TRIGGER trg_withdrawal_exchange_relationship
BEFORE INSERT OR UPDATE ON withdrawals
FOR EACH ROW EXECUTE FUNCTION validate_exchange_relationship_integrity();

DROP TRIGGER IF EXISTS trg_trade_exchange_relationship ON trades;
CREATE TRIGGER trg_trade_exchange_relationship
BEFORE INSERT OR UPDATE ON trades
FOR EACH ROW EXECUTE FUNCTION validate_exchange_relationship_integrity();

INSERT INTO schema_migrations(version)
VALUES ('010_exchange_relationship_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
