BEGIN;

CREATE TABLE IF NOT EXISTS community_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  identity_id UUID,
  guest_token_hash TEXT,
  target_type TEXT NOT NULL CHECK(target_type IN ('news','banner','market_product','forum_thread','forum_post','content')),
  target_id TEXT NOT NULL,
  parent_id BIGINT REFERENCES community_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 10000),
  status TEXT NOT NULL DEFAULT 'visible' CHECK(status IN ('visible','hidden','deleted','pending','blocked')),
  moderation_reason TEXT,
  ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(identity_id IS NOT NULL OR guest_token_hash IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS community_likes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  identity_id UUID,
  guest_token_hash TEXT,
  target_type TEXT NOT NULL CHECK(target_type IN ('news','banner','market_product','forum_thread','forum_post','comment')),
  target_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(identity_id IS NOT NULL OR guest_token_hash IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_like_user_target ON community_likes(identity_id,target_type,target_id) WHERE identity_id IS NOT NULL AND status='active';
CREATE UNIQUE INDEX IF NOT EXISTS uq_like_guest_target ON community_likes(guest_token_hash,target_type,target_id) WHERE guest_token_hash IS NOT NULL AND status='active';
CREATE INDEX IF NOT EXISTS idx_comments_target_status_created ON community_comments(target_type,target_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_identity_created ON community_comments(identity_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_target_status ON community_likes(target_type,target_id,status);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  moderator_identity_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('hide','delete','restore','block','unblock','remove_like','restore_like')),
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_moderation_target_created ON moderation_actions(target_type,target_id,created_at DESC);

INSERT INTO schema_migrations(version) VALUES('011_community_moderation') ON CONFLICT(version) DO NOTHING;
COMMIT;
