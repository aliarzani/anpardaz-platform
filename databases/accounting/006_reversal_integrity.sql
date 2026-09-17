BEGIN;

CREATE TABLE IF NOT EXISTS journal_reversals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  original_transaction_id BIGINT NOT NULL UNIQUE REFERENCES journal_transactions(id) ON DELETE RESTRICT,
  reversal_transaction_id BIGINT NOT NULL UNIQUE REFERENCES journal_transactions(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (original_transaction_id <> reversal_transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_journal_reversals_reversal
  ON journal_reversals(reversal_transaction_id);

INSERT INTO schema_migrations(version)
VALUES ('006_reversal_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
