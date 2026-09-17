BEGIN;

CREATE OR REPLACE FUNCTION assert_journal_transaction_balanced(p_transaction_id BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  debit_total NUMERIC(38,18);
  credit_total NUMERIC(38,18);
BEGIN
  SELECT COALESCE(SUM(amount) FILTER(WHERE direction='debit'),0),COALESCE(SUM(amount) FILTER(WHERE direction='credit'),0)
  INTO debit_total,credit_total FROM journal_entries WHERE journal_transaction_id=p_transaction_id;
  IF debit_total=0 OR debit_total<>credit_total THEN
    RAISE EXCEPTION 'journal transaction % is not balanced',p_transaction_id;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION post_journal_transaction(p_transaction_id BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  PERFORM assert_journal_transaction_balanced(p_transaction_id);
  UPDATE journal_transactions SET status='posted',posted_at=COALESCE(posted_at,NOW()) WHERE id=p_transaction_id AND status='pending';
END $$;

CREATE INDEX IF NOT EXISTS idx_journal_posted ON journal_transactions(status,posted_at DESC);
INSERT INTO schema_migrations(version) VALUES('002_invariants') ON CONFLICT(version) DO NOTHING;
COMMIT;
