BEGIN;

CREATE TABLE IF NOT EXISTS community_rate_buckets (
  bucket_start TIMESTAMPTZ NOT NULL,
  bucket_key TEXT NOT NULL,
  action TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0 CHECK(hits >= 0),
  PRIMARY KEY(bucket_start,bucket_key,action)
);

CREATE TABLE IF NOT EXISTS guest_interaction_blocks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  guest_token_hash TEXT NOT NULL UNIQUE,
  reason TEXT,
  blocked_by UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(expires_at IS NULL OR expires_at > created_at)
);

CREATE TABLE IF NOT EXISTS community_reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporter_identity_id UUID,
  reporter_guest_token_hash TEXT,
  target_type TEXT NOT NULL CHECK(target_type IN ('comment','like','news','banner','market_product','forum_thread','forum_post','content')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK(length(trim(reason)) BETWEEN 1 AND 500),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewing','resolved','rejected')),
  resolution TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(reporter_identity_id IS NOT NULL OR reporter_guest_token_hash IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_community_reports_status_created ON community_reports(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reports_target ON community_reports(target_type,target_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_blocks_expires ON guest_interaction_blocks(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_buckets_start ON community_rate_buckets(bucket_start);

CREATE OR REPLACE FUNCTION cleanup_community_rate_buckets(retention interval DEFAULT interval '2 days')
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE removed BIGINT;
BEGIN
  DELETE FROM community_rate_buckets WHERE bucket_start < NOW() - retention;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$;

INSERT INTO schema_migrations(version) VALUES('015_community_safety') ON CONFLICT(version) DO NOTHING;
COMMIT;
