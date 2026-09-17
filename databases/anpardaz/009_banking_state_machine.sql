BEGIN;

CREATE OR REPLACE FUNCTION validate_transfer_status_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status AND NOT (
    (OLD.status='pending' AND NEW.status IN ('processing','cancelled','failed')) OR
    (OLD.status='processing' AND NEW.status IN ('completed','failed','reversed')) OR
    (OLD.status='completed' AND NEW.status='reversed')
  ) THEN
    RAISE EXCEPTION 'invalid_transfer_status_transition:%->%', OLD.status, NEW.status;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_transfer_status_transition ON transfer_requests;
CREATE TRIGGER trg_transfer_status_transition
BEFORE UPDATE ON transfer_requests
FOR EACH ROW EXECUTE FUNCTION validate_transfer_status_transition();

CREATE OR REPLACE FUNCTION validate_topup_status_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status AND NOT (
    (OLD.status='pending' AND NEW.status IN ('processing','cancelled','failed')) OR
    (OLD.status='processing' AND NEW.status IN ('completed','failed','cancelled'))
  ) THEN
    RAISE EXCEPTION 'invalid_topup_status_transition:%->%', OLD.status, NEW.status;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_topup_status_transition ON topup_requests;
CREATE TRIGGER trg_topup_status_transition
BEFORE UPDATE ON topup_requests
FOR EACH ROW EXECUTE FUNCTION validate_topup_status_transition();

INSERT INTO schema_migrations(version)
VALUES ('009_banking_state_machine')
ON CONFLICT(version) DO NOTHING;

COMMIT;
