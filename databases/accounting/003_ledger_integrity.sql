BEGIN;

CREATE OR REPLACE FUNCTION accounting_reject_posted_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'posted' THEN
    RAISE EXCEPTION 'posted journal transactions are immutable; use a reversal';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_journal_transactions_immutable ON journal_transactions;
CREATE TRIGGER trg_journal_transactions_immutable
BEFORE UPDATE OR DELETE ON journal_transactions
FOR EACH ROW EXECUTE FUNCTION accounting_reject_posted_mutation();

CREATE OR REPLACE FUNCTION accounting_reject_posted_entry_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE tx_status TEXT;
BEGIN
  SELECT status INTO tx_status FROM journal_transactions WHERE id = COALESCE(OLD.transaction_id,NEW.transaction_id);
  IF tx_status = 'posted' THEN
    RAISE EXCEPTION 'entries of a posted journal transaction are immutable';
  END IF;
  RETURN COALESCE(NEW,OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_journal_entries_immutable ON journal_entries;
CREATE TRIGGER trg_journal_entries_immutable
BEFORE UPDATE OR DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION accounting_reject_posted_entry_mutation();

CREATE OR REPLACE FUNCTION accounting_validate_entry_amount()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RAISE EXCEPTION 'journal entry amount must be positive';
  END IF;
  IF (NEW.debit > 0 AND NEW.credit > 0) OR (NEW.debit < 0 OR NEW.credit < 0) THEN
    RAISE EXCEPTION 'journal entry must contain either debit or credit';
  END IF;
  IF NEW.debit = 0 AND NEW.credit = 0 THEN
    RAISE EXCEPTION 'journal entry cannot be zero';
  END IF;
  RETURN NEW;
END;
$$;

INSERT INTO schema_migrations(version) VALUES('003_ledger_integrity') ON CONFLICT(version) DO NOTHING;
COMMIT;
