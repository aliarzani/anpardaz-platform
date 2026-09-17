BEGIN;

CREATE TABLE IF NOT EXISTS ai_prompt_versions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workflow_id BIGINT NOT NULL REFERENCES ai_workflows(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  system_prompt TEXT NOT NULL,
  user_template TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workflow_id,version)
);

CREATE TABLE IF NOT EXISTS ai_execution_runs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workflow_id BIGINT REFERENCES ai_workflows(id),
  provider_id BIGINT REFERENCES ai_providers(id),
  prompt_version_id BIGINT REFERENCES ai_prompt_versions(id),
  requester_identity_id UUID,
  source_type TEXT,
  source_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','succeeded','failed','cancelled')),
  model TEXT,
  input_tokens BIGINT NOT NULL DEFAULT 0,
  output_tokens BIGINT NOT NULL DEFAULT 0,
  cost NUMERIC(38,18) NOT NULL DEFAULT 0 CHECK(cost >= 0),
  request_hash TEXT,
  error_code TEXT,
  error_message TEXT,
  input_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_workflow_runs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workflow_id BIGINT NOT NULL REFERENCES ai_workflows(id),
  content_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','processing','review','published','rejected','failed')),
  auto_publish BOOLEAN NOT NULL DEFAULT FALSE,
  human_review_required BOOLEAN NOT NULL DEFAULT TRUE,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_runs_status_created ON ai_execution_runs(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_runs_source ON ai_execution_runs(source_type,source_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_workflow_runs_status_created ON ai_workflow_runs(status,created_at DESC);

INSERT INTO schema_migrations(version) VALUES('016_ai_execution') ON CONFLICT(version) DO NOTHING;
COMMIT;
