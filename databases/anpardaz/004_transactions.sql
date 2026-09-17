BEGIN;

CREATE INDEX IF NOT EXISTS idx_transactions_status_created ON transactions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference) WHERE reference IS NOT NULL;

INSERT INTO schema_migrations (version)
VALUES ('004_transactions')
ON CONFLICT (version) DO NOTHING;

COMMIT;
