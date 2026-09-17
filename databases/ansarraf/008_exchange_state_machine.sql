BEGIN;

CREATE OR REPLACE FUNCTION validate_order_status_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status AND NOT (
    (OLD.status='open' AND NEW.status IN ('partially_filled','filled','cancelled','rejected')) OR
    (OLD.status='partially_filled' AND NEW.status IN ('partially_filled','filled','cancelled')) OR
    (OLD.status IN ('filled','cancelled','rejected') AND NEW.status=OLD.status)
  ) THEN
    RAISE EXCEPTION 'invalid_order_status_transition:%->%', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_order_status_transition ON orders;
CREATE TRIGGER trg_order_status_transition
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION validate_order_status_transition();

CREATE OR REPLACE FUNCTION validate_deposit_status_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status AND NOT (
    (OLD.status='pending' AND NEW.status IN ('confirmed','failed')) OR
    (OLD.status IN ('confirmed','failed') AND NEW.status=OLD.status)
  ) THEN
    RAISE EXCEPTION 'invalid_deposit_status_transition:%->%', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_deposit_status_transition ON deposits;
CREATE TRIGGER trg_deposit_status_transition
BEFORE UPDATE ON deposits
FOR EACH ROW EXECUTE FUNCTION validate_deposit_status_transition();

CREATE OR REPLACE FUNCTION validate_withdrawal_status_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status AND NOT (
    (OLD.status='pending' AND NEW.status IN ('processing','failed','cancelled')) OR
    (OLD.status='processing' AND NEW.status IN ('completed','failed')) OR
    (OLD.status IN ('completed','failed','cancelled') AND NEW.status=OLD.status)
  ) THEN
    RAISE EXCEPTION 'invalid_withdrawal_status_transition:%->%', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_withdrawal_status_transition ON withdrawals;
CREATE TRIGGER trg_withdrawal_status_transition
BEFORE UPDATE ON withdrawals
FOR EACH ROW EXECUTE FUNCTION validate_withdrawal_status_transition();

INSERT INTO schema_migrations(version)
VALUES ('008_exchange_state_machine')
ON CONFLICT(version) DO NOTHING;

COMMIT;
