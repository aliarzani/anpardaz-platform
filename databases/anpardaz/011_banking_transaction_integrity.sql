BEGIN;

CREATE OR REPLACE FUNCTION validate_banking_transaction_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE account_currency CHAR(3); account_status TEXT;
BEGIN
  SELECT currency,status INTO account_currency,account_status
  FROM accounts WHERE id=NEW.account_id;

  IF account_currency IS NULL THEN
    RAISE EXCEPTION 'transaction_account_not_found';
  END IF;
  IF account_currency<>NEW.currency THEN
    RAISE EXCEPTION 'transaction_account_currency_mismatch';
  END IF;
  IF TG_OP='INSERT' AND account_status<>'active' THEN
    RAISE EXCEPTION 'transaction_account_not_active';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_banking_transaction_integrity ON transactions;
CREATE TRIGGER trg_banking_transaction_integrity
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION validate_banking_transaction_integrity();

CREATE OR REPLACE FUNCTION validate_banking_transaction_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status<>OLD.status AND NOT (
    (OLD.status='pending' AND NEW.status IN ('completed','failed','reversed')) OR
    (OLD.status='completed' AND NEW.status='reversed') OR
    (OLD.status IN ('failed','reversed') AND NEW.status=OLD.status)
  ) THEN
    RAISE EXCEPTION 'invalid_transaction_status_transition:%->%',OLD.status,NEW.status;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_banking_transaction_status ON transactions;
CREATE TRIGGER trg_banking_transaction_status
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION validate_banking_transaction_status();

CREATE OR REPLACE FUNCTION protect_banking_account_currency()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.currency<>OLD.currency THEN
    RAISE EXCEPTION 'account_currency_immutable';
  END IF;
  IF OLD.status='closed' AND NEW.status<>OLD.status THEN
    RAISE EXCEPTION 'closed_account_status_immutable';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_banking_account_protection ON accounts;
CREATE TRIGGER trg_banking_account_protection
BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION protect_banking_account_currency();

CREATE INDEX IF NOT EXISTS idx_transactions_account_status_created
  ON transactions(account_id,status,created_at DESC);

INSERT INTO schema_migrations(version)
VALUES ('011_banking_transaction_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
