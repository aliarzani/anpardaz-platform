BEGIN;

CREATE OR REPLACE FUNCTION validate_market_order_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  product_status TEXT;
  offer_product BIGINT;
  offer_price NUMERIC(24,8);
  offer_currency CHAR(3);
  offer_availability TEXT;
BEGIN
  SELECT status INTO product_status
  FROM market_products
  WHERE id=NEW.product_id;

  IF product_status IS NULL OR product_status<>'published' THEN
    RAISE EXCEPTION 'market_product_not_orderable';
  END IF;

  IF NEW.offer_id IS NULL THEN
    RAISE EXCEPTION 'market_offer_required';
  END IF;

  SELECT product_id,price,currency,availability
    INTO offer_product,offer_price,offer_currency,offer_availability
  FROM market_offers
  WHERE id=NEW.offer_id;

  IF offer_product IS NULL OR offer_product<>NEW.product_id THEN
    RAISE EXCEPTION 'market_offer_product_mismatch';
  END IF;

  IF offer_availability='out_of_stock' THEN
    RAISE EXCEPTION 'market_offer_unavailable';
  END IF;

  IF offer_currency<>NEW.currency OR offer_price<>NEW.unit_price THEN
    RAISE EXCEPTION 'market_offer_price_currency_mismatch';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_market_order_integrity ON market_orders;
CREATE TRIGGER trg_market_order_integrity
BEFORE INSERT OR UPDATE ON market_orders
FOR EACH ROW EXECUTE FUNCTION validate_market_order_integrity();

CREATE OR REPLACE FUNCTION validate_market_relationship_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE listing_status TEXT;
DECLARE product_status TEXT;
BEGIN
  IF TG_TABLE_NAME='banner_inquiries' THEN
    SELECT status INTO listing_status FROM banner_listings WHERE id=NEW.listing_id;
    IF listing_status IS NULL OR listing_status='archived' THEN
      RAISE EXCEPTION 'banner_listing_not_available';
    END IF;
  ELSIF TG_TABLE_NAME='banner_favorites' THEN
    SELECT status INTO listing_status FROM banner_listings WHERE id=NEW.listing_id;
    IF listing_status IS NULL OR listing_status='archived' THEN
      RAISE EXCEPTION 'banner_listing_not_available';
    END IF;
  ELSIF TG_TABLE_NAME='market_favorites' THEN
    SELECT status INTO product_status FROM market_products WHERE id=NEW.product_id;
    IF product_status IS NULL OR product_status='archived' THEN
      RAISE EXCEPTION 'market_product_not_available';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_banner_inquiry_relationship ON banner_inquiries;
CREATE TRIGGER trg_banner_inquiry_relationship
BEFORE INSERT OR UPDATE ON banner_inquiries
FOR EACH ROW EXECUTE FUNCTION validate_market_relationship_integrity();

DROP TRIGGER IF EXISTS trg_banner_favorite_relationship ON banner_favorites;
CREATE TRIGGER trg_banner_favorite_relationship
BEFORE INSERT OR UPDATE ON banner_favorites
FOR EACH ROW EXECUTE FUNCTION validate_market_relationship_integrity();

DROP TRIGGER IF EXISTS trg_market_favorite_relationship ON market_favorites;
CREATE TRIGGER trg_market_favorite_relationship
BEFORE INSERT OR UPDATE ON market_favorites
FOR EACH ROW EXECUTE FUNCTION validate_market_relationship_integrity();

CREATE OR REPLACE FUNCTION validate_financial_category_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  category_identity UUID;
  category_type TEXT;
BEGIN
  IF NEW.category_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT identity_id,type INTO category_identity,category_type
  FROM financial_categories
  WHERE id=NEW.category_id;

  IF category_identity IS NULL OR category_identity<>NEW.identity_id THEN
    RAISE EXCEPTION 'financial_category_owner_mismatch';
  END IF;

  IF TG_TABLE_NAME='financial_entries' AND category_type<>NEW.type THEN
    RAISE EXCEPTION 'financial_category_type_mismatch';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_financial_entry_category_integrity ON financial_entries;
CREATE TRIGGER trg_financial_entry_category_integrity
BEFORE INSERT OR UPDATE ON financial_entries
FOR EACH ROW EXECUTE FUNCTION validate_financial_category_integrity();

DROP TRIGGER IF EXISTS trg_financial_budget_category_integrity ON financial_budgets;
CREATE TRIGGER trg_financial_budget_category_integrity
BEFORE INSERT OR UPDATE ON financial_budgets
FOR EACH ROW EXECUTE FUNCTION validate_financial_category_integrity();

INSERT INTO schema_migrations(version)
VALUES ('026_ecosystem_relationship_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
