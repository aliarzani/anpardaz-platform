BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY,applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

CREATE TABLE IF NOT EXISTS ledger_accounts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK(account_type IN ('asset','liability','equity','revenue','expense')),
  owner_identity_id UUID,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','blocked','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  transaction_uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'posted' CHECK(status IN ('pending','posted','reversed','voided')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  journal_transaction_id BIGINT NOT NULL REFERENCES journal_transactions(id) ON DELETE RESTRICT,
  ledger_account_id BIGINT NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
  direction TEXT NOT NULL CHECK(direction IN ('debit','credit')),
  amount NUMERIC(38,18) NOT NULL CHECK(amount > 0),
  currency TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_holds (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ledger_account_id BIGINT NOT NULL REFERENCES ledger_accounts(id),
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  amount NUMERIC(38,18) NOT NULL CHECK(amount > 0),
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','released','captured','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS accounting_adjustments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  journal_transaction_id BIGINT NOT NULL REFERENCES journal_transactions(id),
  reason TEXT NOT NULL,
  approved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_accounts_owner ON ledger_accounts(owner_identity_id);
CREATE INDEX IF NOT EXISTS idx_journal_reference ON journal_transactions(reference_type,reference_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_transaction ON journal_entries(journal_transaction_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_account ON journal_entries(ledger_account_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_holds_reference ON ledger_holds(reference_type,reference_id);

INSERT INTO schema_migrations(version) VALUES('001_foundation') ON CONFLICT(version) DO NOTHING;
COMMIT;
