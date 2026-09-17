BEGIN;

ALTER TABLE community_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE guest_interaction_blocks ADD COLUMN IF NOT EXISTS blocked_by UUID;

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
