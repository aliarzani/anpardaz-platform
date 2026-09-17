BEGIN;

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_cleanup
  ON auth_rate_limits(window_start);

INSERT INTO schema_migrations(version)
VALUES ('021_auth_rate_limit_maintenance')
ON CONFLICT(version) DO NOTHING;

COMMIT;
