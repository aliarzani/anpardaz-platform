BEGIN;

ALTER TABLE topup_requests ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_topup_customer_idempotency
  ON topup_requests(customer_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_accounts_customer_currency_status
  ON accounts(customer_id, currency, status);
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON cards(account_id);

CREATE OR REPLACE FUNCTION validate_transfer_request_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE src_currency CHAR(3); dst_currency CHAR(3);
BEGIN
  SELECT currency INTO src_currency FROM accounts WHERE id=NEW.source_account_id;
  IF src_currency IS NULL OR src_currency<>NEW.currency THEN
    RAISE EXCEPTION 'transfer_source_currency_mismatch';
  END IF;
  IF NEW.destination_account_id IS NOT NULL THEN
    SELECT currency INTO dst_currency FROM accounts WHERE id=NEW.destination_account_id;
    IF dst_currency IS NULL OR dst_currency<>NEW.currency THEN
      RAISE EXCEPTION 'transfer_destination_currency_mismatch';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_transfer_request_integrity ON transfer_requests;
CREATE TRIGGER trg_transfer_request_integrity
BEFORE INSERT OR UPDATE ON transfer_requests
FOR EACH ROW EXECUTE FUNCTION validate_transfer_request_integrity();

CREATE OR REPLACE FUNCTION validate_topup_request_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE account_currency CHAR(3);
BEGIN
  SELECT currency INTO account_currency FROM accounts WHERE id=NEW.account_id;
  IF account_currency IS NULL OR account_currency<>NEW.currency THEN
    RAISE EXCEPTION 'topup_account_currency_mismatch';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_topup_request_integrity ON topup_requests;
CREATE TRIGGER trg_topup_request_integrity
BEFORE INSERT OR UPDATE ON topup_requests
FOR EACH ROW EXECUTE FUNCTION validate_topup_request_integrity();

INSERT INTO schema_migrations(version)
VALUES ('007_banking_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
