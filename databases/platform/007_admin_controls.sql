BEGIN;

-- Global admin controls. These settings are operational configuration, not
-- financial source-of-truth data.
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by BIGINT REFERENCES platform_users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_announcements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  show_on_web BOOLEAN NOT NULL DEFAULT TRUE,
  show_on_mobile BOOLEAN NOT NULL DEFAULT TRUE,
  dismissible BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_action_requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id BIGINT NOT NULL REFERENCES platform_users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('requested','approved','rejected','completed','failed')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_maintenance_active_window ON maintenance_announcements(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_actor_created ON admin_action_requests(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_resource_created ON admin_action_requests(resource_type, resource_id, created_at DESC);

INSERT INTO platform_settings(key,value)
VALUES ('maintenance_mode', '{"enabled":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO platform_settings(key,value)
VALUES ('content_auto_publish', '{"enabled":true,"requires_review":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('007_admin_controls')
ON CONFLICT (version) DO NOTHING;

COMMIT;
