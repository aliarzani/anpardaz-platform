BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS identity_id UUID;
UPDATE platform_users SET identity_id = gen_random_uuid() WHERE identity_id IS NULL;
ALTER TABLE platform_users ALTER COLUMN identity_id SET NOT NULL;
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
CREATE UNIQUE INDEX IF NOT EXISTS uq_platform_users_identity_id ON platform_users(identity_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_platform_users_email_lower ON platform_users(LOWER(email)) WHERE email IS NOT NULL;

INSERT INTO schema_migrations (version) VALUES ('005_identity') ON CONFLICT (version) DO NOTHING;
COMMIT;
