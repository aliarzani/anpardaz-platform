BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS identity_id UUID;
UPDATE customers SET identity_id = external_user_id::uuid WHERE identity_id IS NULL AND external_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
UPDATE customers SET identity_id = gen_random_uuid() WHERE identity_id IS NULL;
ALTER TABLE customers ALTER COLUMN identity_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_identity_id ON customers(identity_id);
CREATE INDEX IF NOT EXISTS idx_customers_identity_id ON customers(identity_id);

INSERT INTO schema_migrations (version) VALUES ('005_identity') ON CONFLICT (version) DO NOTHING;
COMMIT;
