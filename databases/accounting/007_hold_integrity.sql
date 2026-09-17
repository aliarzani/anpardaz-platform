BEGIN;

CREATE OR REPLACE FUNCTION validate_ledger_hold_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE account_currency TEXT;
BEGIN
  SELECT currency INTO account_currency
  FROM ledger_accounts
  WHERE id=NEW.ledger_account_id
    AND status='active';

  IF account_currency IS NULL THEN
    RAISE EXCEPTION 'ledger_account_not_active';
  END IF;

  IF account_currency <> NEW.currency THEN
    RAISE EXCEPTION 'hold_currency_mismatch';
  END IF;

  IF NEW.status='active' AND OLD.status IS NOT NULL AND OLD.status <> 'active' THEN
    RAISE EXCEPTION 'hold_cannot_reactivate';
  END IF;

  IF NEW.status IN ('released','captured','cancelled') AND NEW.released_at IS NULL THEN
    NEW.released_at := NOW();
  END IF;

  IF NEW.status='active' THEN
    NEW.released_at := NULL;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_ledger_hold_integrity ON ledger_holds;
CREATE TRIGGER trg_ledger_hold_integrity
BEFORE INSERT OR UPDATE ON ledger_holds
FOR EACH ROW EXECUTE FUNCTION validate_ledger_hold_integrity();

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_hold_reference
  ON ledger_holds(reference_type, reference_id)
  WHERE status='active';

CREATE INDEX IF NOT EXISTS idx_holds_account_status
  ON ledger_holds(ledger_account_id,status,created_at DESC);

INSERT INTO schema_migrations(version)
VALUES ('007_hold_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
