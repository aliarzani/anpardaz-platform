BEGIN;

CREATE OR REPLACE FUNCTION validate_financial_category_hierarchy()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  parent_identity UUID;
  parent_type TEXT;
  parent_active BOOLEAN;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.parent_id=NEW.id THEN
    RAISE EXCEPTION 'financial_category_self_parent';
  END IF;

  SELECT identity_id,type,active
    INTO parent_identity,parent_type,parent_active
  FROM financial_categories
  WHERE id=NEW.parent_id;

  IF parent_identity IS NULL OR parent_identity<>NEW.identity_id THEN
    RAISE EXCEPTION 'financial_category_parent_owner_mismatch';
  END IF;

  IF parent_type<>NEW.type THEN
    RAISE EXCEPTION 'financial_category_parent_type_mismatch';
  END IF;

  IF parent_active IS NOT TRUE THEN
    RAISE EXCEPTION 'financial_category_parent_inactive';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_financial_category_hierarchy ON financial_categories;
CREATE TRIGGER trg_financial_category_hierarchy
BEFORE INSERT OR UPDATE ON financial_categories
FOR EACH ROW EXECUTE FUNCTION validate_financial_category_hierarchy();

CREATE OR REPLACE FUNCTION validate_financial_category_active_use()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  category_active BOOLEAN;
BEGIN
  IF NEW.category_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT active INTO category_active
  FROM financial_categories
  WHERE id=NEW.category_id;

  IF category_active IS NOT TRUE THEN
    RAISE EXCEPTION 'financial_category_inactive';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_financial_entry_active_category ON financial_entries;
CREATE TRIGGER trg_financial_entry_active_category
BEFORE INSERT OR UPDATE ON financial_entries
FOR EACH ROW EXECUTE FUNCTION validate_financial_category_active_use();

DROP TRIGGER IF EXISTS trg_financial_budget_active_category ON financial_budgets;
CREATE TRIGGER trg_financial_budget_active_category
BEFORE INSERT OR UPDATE ON financial_budgets
FOR EACH ROW EXECUTE FUNCTION validate_financial_category_active_use();

INSERT INTO schema_migrations(version)
VALUES ('028_financial_category_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
