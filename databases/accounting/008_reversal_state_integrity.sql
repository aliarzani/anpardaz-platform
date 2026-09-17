BEGIN;

CREATE OR REPLACE FUNCTION validate_journal_reversal_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  original_status TEXT;
  reversal_status TEXT;
BEGIN
  SELECT status INTO original_status
  FROM journal_transactions
  WHERE id=NEW.original_transaction_id;

  SELECT status INTO reversal_status
  FROM journal_transactions
  WHERE id=NEW.reversal_transaction_id;

  IF original_status<>'reversed' THEN
    RAISE EXCEPTION 'original_transaction_not_reversed';
  END IF;

  IF reversal_status<>'posted' THEN
    RAISE EXCEPTION 'reversal_transaction_not_posted';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_journal_reversal_integrity ON journal_reversals;
CREATE TRIGGER trg_journal_reversal_integrity
BEFORE INSERT OR UPDATE ON journal_reversals
FOR EACH ROW EXECUTE FUNCTION validate_journal_reversal_integrity();

INSERT INTO schema_migrations(version)
VALUES ('008_reversal_state_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
