BEGIN;

CREATE OR REPLACE FUNCTION validate_ledger_entry_currency()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE account_currency TEXT;
BEGIN
  SELECT currency INTO account_currency FROM ledger_accounts WHERE id=NEW.ledger_account_id;
  IF account_currency IS NULL THEN
    RAISE EXCEPTION 'ledger_account_not_found';
  END IF;
  IF account_currency<>NEW.currency THEN
    RAISE EXCEPTION 'ledger_entry_currency_mismatch';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_ledger_entry_currency ON journal_entries;
CREATE TRIGGER trg_ledger_entry_currency
BEFORE INSERT OR UPDATE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION validate_ledger_entry_currency();

CREATE INDEX IF NOT EXISTS idx_journal_entries_currency_account
  ON journal_entries(currency, ledger_account_id, created_at DESC);

INSERT INTO schema_migrations(version)
VALUES ('004_currency_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
