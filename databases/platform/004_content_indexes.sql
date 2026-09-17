BEGIN;

CREATE INDEX IF NOT EXISTS idx_banner_city_status_created ON banner_listings(city, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_products_status_created ON market_products(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_platform_users_status_created ON platform_users(status, created_at DESC);

INSERT INTO schema_migrations (version)
VALUES ('004_content_indexes')
ON CONFLICT (version) DO NOTHING;

COMMIT;
