BEGIN;
CREATE TABLE IF NOT EXISTS transfer_requests(id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,customer_id BIGINT NOT NULL REFERENCES customers(id),source_account_id BIGINT NOT NULL REFERENCES accounts(id),destination_account_id BIGINT REFERENCES accounts(id),destination_external TEXT,amount NUMERIC(24,8) NOT NULL CHECK(amount>0),currency CHAR(3) NOT NULL,description TEXT,idempotency_key TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','completed','failed','cancelled','reversed')),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),CHECK(destination_account_id IS NOT NULL OR destination_external IS NOT NULL),UNIQUE(customer_id,idempotency_key));
CREATE TABLE IF NOT EXISTS topup_requests(id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,customer_id BIGINT NOT NULL REFERENCES customers(id),account_id BIGINT NOT NULL REFERENCES accounts(id),amount NUMERIC(24,8) NOT NULL CHECK(amount>0),currency CHAR(3) NOT NULL,provider TEXT,external_reference TEXT UNIQUE,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','completed','failed','cancelled')),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_transfer_customer_created ON transfer_requests(customer_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transfer_status_created ON transfer_requests(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topup_customer_created ON topup_requests(customer_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topup_status_created ON topup_requests(status,created_at DESC);
INSERT INTO schema_migrations(version) VALUES('006_banking_lifecycle') ON CONFLICT(version) DO NOTHING;
COMMIT;
