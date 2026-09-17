BEGIN;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin','support'));
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_email ON customers (LOWER(email)) WHERE email IS NOT NULL;

INSERT INTO schema_migrations (version)
VALUES ('003_auth')
ON CONFLICT (version) DO NOTHING;

COMMIT;
