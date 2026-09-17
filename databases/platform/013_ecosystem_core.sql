BEGIN;

-- An Banner
CREATE TABLE IF NOT EXISTS banner_media (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,listing_id BIGINT NOT NULL REFERENCES banner_listings(id) ON DELETE CASCADE,url TEXT NOT NULL,media_type TEXT NOT NULL CHECK(media_type IN ('image','video')),sort_order INTEGER NOT NULL DEFAULT 0,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS banner_favorites (user_id BIGINT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,listing_id BIGINT NOT NULL REFERENCES banner_listings(id) ON DELETE CASCADE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(user_id,listing_id));
CREATE TABLE IF NOT EXISTS banner_inquiries (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,listing_id BIGINT NOT NULL REFERENCES banner_listings(id) ON DELETE CASCADE,buyer_user_id BIGINT REFERENCES platform_users(id),message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','replied','closed','blocked')),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

-- An Market
CREATE TABLE IF NOT EXISTS market_media (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,product_id BIGINT NOT NULL REFERENCES market_products(id) ON DELETE CASCADE,url TEXT NOT NULL,sort_order INTEGER NOT NULL DEFAULT 0,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS market_offers (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,product_id BIGINT NOT NULL REFERENCES market_products(id) ON DELETE CASCADE,seller_name TEXT NOT NULL,seller_url TEXT,price NUMERIC(24,8) NOT NULL CHECK(price>=0),currency CHAR(3) NOT NULL,availability TEXT NOT NULL DEFAULT 'in_stock',shipping_cost NUMERIC(24,8),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS market_favorites (user_id BIGINT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,product_id BIGINT NOT NULL REFERENCES market_products(id) ON DELETE CASCADE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(user_id,product_id));
CREATE TABLE IF NOT EXISTS market_orders (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,user_id BIGINT NOT NULL REFERENCES platform_users(id),product_id BIGINT NOT NULL REFERENCES market_products(id),offer_id BIGINT REFERENCES market_offers(id),quantity NUMERIC(18,6) NOT NULL CHECK(quantity>0),unit_price NUMERIC(24,8) NOT NULL CHECK(unit_price>=0),currency CHAR(3) NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','processing','shipped','completed','cancelled','refunded')),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

-- Forum moderation
ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'visible';
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'visible';

-- News/SEO/editorial
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(id);
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER;
CREATE TABLE IF NOT EXISTS content_revisions (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,article_id BIGINT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,editor_identity_id UUID,version INTEGER NOT NULL,content JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(article_id,version));

-- An Hoosh / AI assistant
CREATE TABLE IF NOT EXISTS hoosh_conversations (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,identity_id UUID NOT NULL,title TEXT,model TEXT,status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived','blocked')),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS hoosh_messages (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,conversation_id BIGINT NOT NULL REFERENCES hoosh_conversations(id) ON DELETE CASCADE,role TEXT NOT NULL CHECK(role IN ('user','assistant','system','tool')),content TEXT NOT NULL,metadata JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS hoosh_usage (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,identity_id UUID NOT NULL,conversation_id BIGINT REFERENCES hoosh_conversations(id),provider TEXT,model TEXT,input_tokens BIGINT NOT NULL DEFAULT 0,output_tokens BIGINT NOT NULL DEFAULT 0,cost NUMERIC(24,12) NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed','failed')),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS hoosh_requests (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,identity_id UUID NOT NULL,conversation_id BIGINT REFERENCES hoosh_conversations(id),request_text TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','completed','failed','cancelled')),provider TEXT,model TEXT,error TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),completed_at TIMESTAMPTZ);

-- Financial Center
CREATE TABLE IF NOT EXISTS financial_categories (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,identity_id UUID NOT NULL,name TEXT NOT NULL,type TEXT NOT NULL CHECK(type IN ('income','expense')),parent_id BIGINT REFERENCES financial_categories(id),active BOOLEAN NOT NULL DEFAULT TRUE,UNIQUE(identity_id,name,type));
CREATE TABLE IF NOT EXISTS financial_entries (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,identity_id UUID NOT NULL,category_id BIGINT REFERENCES financial_categories(id),type TEXT NOT NULL CHECK(type IN ('income','expense')),amount NUMERIC(24,8) NOT NULL CHECK(amount>0),currency CHAR(3) NOT NULL,description TEXT,source TEXT,occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS financial_budgets (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,identity_id UUID NOT NULL,category_id BIGINT REFERENCES financial_categories(id),amount NUMERIC(24,8) NOT NULL CHECK(amount>=0),currency CHAR(3) NOT NULL,period_start DATE NOT NULL,period_end DATE NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),CHECK(period_end>=period_start));

CREATE INDEX IF NOT EXISTS idx_banner_media_listing ON banner_media(listing_id,sort_order);
CREATE INDEX IF NOT EXISTS idx_banner_inquiries_listing ON banner_inquiries(listing_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_offers_product_price ON market_offers(product_id,price);
CREATE INDEX IF NOT EXISTS idx_market_orders_user_created ON market_orders(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hoosh_conversations_identity ON hoosh_conversations(identity_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_hoosh_messages_conversation ON hoosh_messages(conversation_id,created_at);
CREATE INDEX IF NOT EXISTS idx_hoosh_usage_identity ON hoosh_usage(identity_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_entries_identity_date ON financial_entries(identity_id,occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_budgets_identity_period ON financial_budgets(identity_id,period_start,period_end);

INSERT INTO schema_migrations(version) VALUES('013_ecosystem_core') ON CONFLICT(version) DO NOTHING;
COMMIT;
