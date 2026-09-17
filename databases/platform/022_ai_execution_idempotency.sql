BEGIN;

ALTER TABLE ai_execution_runs
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_execution_runs_idempotency_key
  ON ai_execution_runs(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_execution_runs_created_at
  ON ai_execution_runs(created_at DESC);

INSERT INTO schema_migrations(version)
VALUES ('022_ai_execution_idempotency')
ON CONFLICT(version) DO NOTHING;

COMMIT;
