BEGIN;

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope TEXT NOT NULL,
  client_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  UNIQUE(scope, client_key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_window ON auth_rate_limits(window_start);

INSERT INTO schema_migrations(version) VALUES ('020_auth_security') ON CONFLICT(version) DO NOTHING;
COMMIT;
