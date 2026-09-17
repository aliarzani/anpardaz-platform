BEGIN;

ALTER TABLE journal_transactions
  ADD COLUMN IF NOT EXISTS request_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_journal_transactions_request_hash
  ON journal_transactions(request_hash)
  WHERE request_hash IS NOT NULL;

INSERT INTO schema_migrations(version)
VALUES ('005_idempotency_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
