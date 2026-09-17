BEGIN;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  external_user_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','blocked','pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('crypto','fiat','stablecoin')),
  decimals INTEGER NOT NULL DEFAULT 8 CHECK (decimals BETWEEN 0 AND 18),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  asset_id BIGINT NOT NULL REFERENCES assets(id),
  available_balance NUMERIC(36,18) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  locked_balance NUMERIC(36,18) NOT NULL DEFAULT 0 CHECK (locked_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (customer_id, asset_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  base_asset_id BIGINT NOT NULL REFERENCES assets(id),
  quote_asset_id BIGINT NOT NULL REFERENCES assets(id),
  side TEXT NOT NULL CHECK (side IN ('buy','sell')),
  order_type TEXT NOT NULL CHECK (order_type IN ('market','limit')),
  quantity NUMERIC(36,18) NOT NULL CHECK (quantity > 0),
  price NUMERIC(36,18) CHECK (price > 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','partially_filled','filled','cancelled','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trades (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id),
  quantity NUMERIC(36,18) NOT NULL CHECK (quantity > 0),
  price NUMERIC(36,18) NOT NULL CHECK (price > 0),
  fee_amount NUMERIC(36,18) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
  fee_asset_id BIGINT REFERENCES assets(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deposits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  asset_id BIGINT NOT NULL REFERENCES assets(id),
  amount NUMERIC(36,18) NOT NULL CHECK (amount > 0),
  network TEXT,
  external_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  asset_id BIGINT NOT NULL REFERENCES assets(id),
  amount NUMERIC(36,18) NOT NULL CHECK (amount > 0),
  network TEXT,
  destination TEXT NOT NULL,
  external_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_customer_id ON wallets(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_order_id ON trades(order_id);
CREATE INDEX IF NOT EXISTS idx_deposits_customer_created ON deposits(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_customer_created ON withdrawals(customer_id, created_at DESC);

INSERT INTO schema_migrations (version)
VALUES ('002_core')
ON CONFLICT (version) DO NOTHING;

COMMIT;
