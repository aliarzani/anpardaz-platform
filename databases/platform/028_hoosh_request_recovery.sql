BEGIN;

ALTER TABLE hoosh_requests
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_hoosh_requests_status_started
  ON hoosh_requests(status,started_at);

INSERT INTO schema_migrations(version)
VALUES ('028_hoosh_request_recovery')
ON CONFLICT(version) DO NOTHING;

COMMIT;
