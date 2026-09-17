BEGIN;

CREATE OR REPLACE FUNCTION reject_posted_ledger_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'journal_transactions' THEN
    IF OLD.status = 'posted' AND (TG_OP = 'DELETE' OR NEW IS DISTINCT FROM OLD) THEN
      RAISE EXCEPTION 'posted journal transaction % is immutable', OLD.id;
    END IF;
  ELSIF TG_TABLE_NAME = 'journal_entries' THEN
    IF EXISTS (SELECT 1 FROM journal_transactions t WHERE t.id = OLD.journal_transaction_id AND t.status = 'posted') THEN
      RAISE EXCEPTION 'entries of posted journal transaction % are immutable', OLD.journal_transaction_id;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_journal_transactions_immutable ON journal_transactions;
CREATE TRIGGER trg_journal_transactions_immutable BEFORE UPDATE OR DELETE ON journal_transactions FOR EACH ROW EXECUTE FUNCTION reject_posted_ledger_mutation();
DROP TRIGGER IF EXISTS trg_journal_entries_immutable ON journal_entries;
CREATE TRIGGER trg_journal_entries_immutable BEFORE UPDATE OR DELETE ON journal_entries FOR EACH ROW EXECUTE FUNCTION reject_posted_ledger_mutation();

CREATE OR REPLACE FUNCTION assert_journal_currency_consistent(p_transaction_id BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE c INTEGER;
BEGIN
  SELECT COUNT(DISTINCT currency) INTO c FROM journal_entries WHERE journal_transaction_id=p_transaction_id;
  IF c > 1 THEN RAISE EXCEPTION 'journal transaction % mixes currencies', p_transaction_id; END IF;
END $$;

CREATE OR REPLACE FUNCTION assert_journal_transaction_balanced(p_transaction_id BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE debit_total NUMERIC(38,18); credit_total NUMERIC(38,18);
BEGIN
  PERFORM assert_journal_currency_consistent(p_transaction_id);
  SELECT COALESCE(SUM(amount) FILTER(WHERE direction='debit'),0),COALESCE(SUM(amount) FILTER(WHERE direction='credit'),0) INTO debit_total,credit_total FROM journal_entries WHERE journal_transaction_id=p_transaction_id;
  IF debit_total=0 OR debit_total<>credit_total THEN RAISE EXCEPTION 'journal transaction % is not balanced',p_transaction_id; END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_holds_account_status ON ledger_holds(ledger_account_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holds_active_reference ON ledger_holds(reference_type,reference_id) WHERE status='active';
INSERT INTO schema_migrations(version) VALUES('003_ledger_hardening') ON CONFLICT(version) DO NOTHING;
COMMIT;
