BEGIN;

ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','editor','moderator'));
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS uq_platform_users_email ON platform_users (LOWER(email)) WHERE email IS NOT NULL;

INSERT INTO schema_migrations (version)
VALUES ('003_auth')
ON CONFLICT (version) DO NOTHING;

COMMIT;
