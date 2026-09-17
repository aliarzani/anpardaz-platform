BEGIN;

CREATE TABLE IF NOT EXISTS community_reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporter_identity_id UUID,
  reporter_guest_token_hash TEXT,
  target_type TEXT NOT NULL CHECK(target_type IN ('comment','like','news','banner','market_product','forum_thread','forum_post','content')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK(length(trim(reason)) BETWEEN 1 AND 500),
  details TEXT CHECK(details IS NULL OR length(details) <= 5000),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewing','resolved','rejected')),
  resolution TEXT,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CHECK(reporter_identity_id IS NOT NULL OR reporter_guest_token_hash IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS guest_interaction_blocks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_token_hash TEXT NOT NULL UNIQUE,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_rate_buckets (
  bucket_start TIMESTAMPTZ NOT NULL,
  bucket_key TEXT NOT NULL,
  action TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0 CHECK(hits >= 0),
  PRIMARY KEY(bucket_start,bucket_key,action)
);

CREATE INDEX IF NOT EXISTS idx_reports_status_created ON community_reports(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_target_created ON community_reports(target_type,target_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_blocks_expiry ON guest_interaction_blocks(expires_at);

INSERT INTO schema_migrations(version) VALUES('012_community_safety') ON CONFLICT(version) DO NOTHING;
COMMIT;
