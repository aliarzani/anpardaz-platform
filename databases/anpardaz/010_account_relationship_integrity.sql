BEGIN;

CREATE OR REPLACE FUNCTION validate_banking_relationship_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  account_customer BIGINT;
  account_status TEXT;
  destination_customer BIGINT;
  destination_status TEXT;
BEGIN
  IF TG_TABLE_NAME='cards' THEN
    IF NEW.account_id IS NOT NULL THEN
      SELECT customer_id,status INTO account_customer,account_status
      FROM accounts WHERE id=NEW.account_id;
      IF account_customer IS NULL OR account_customer<>NEW.customer_id THEN
        RAISE EXCEPTION 'card_account_customer_mismatch';
      END IF;
      IF account_status<>'active' THEN
        RAISE EXCEPTION 'card_account_not_active';
      END IF;
    END IF;
  ELSIF TG_TABLE_NAME='topup_requests' THEN
    SELECT customer_id,status INTO account_customer,account_status
    FROM accounts WHERE id=NEW.account_id;
    IF account_customer IS NULL OR account_customer<>NEW.customer_id THEN
      RAISE EXCEPTION 'topup_account_customer_mismatch';
    END IF;
    IF account_status<>'active' THEN
      RAISE EXCEPTION 'topup_account_not_active';
    END IF;
  ELSIF TG_TABLE_NAME='transfer_requests' THEN
    SELECT customer_id,status INTO account_customer,account_status
    FROM accounts WHERE id=NEW.source_account_id;
    IF account_customer IS NULL OR account_customer<>NEW.customer_id THEN
      RAISE EXCEPTION 'transfer_source_customer_mismatch';
    END IF;
    IF account_status<>'active' THEN
      RAISE EXCEPTION 'transfer_source_not_active';
    END IF;

    IF NEW.destination_account_id IS NOT NULL THEN
      SELECT customer_id,status INTO destination_customer,destination_status
      FROM accounts WHERE id=NEW.destination_account_id;
      IF destination_customer IS NULL OR destination_status<>'active' THEN
        RAISE EXCEPTION 'transfer_destination_not_active';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_cards_relationship_integrity ON cards;
CREATE TRIGGER trg_cards_relationship_integrity
BEFORE INSERT OR UPDATE ON cards
FOR EACH ROW EXECUTE FUNCTION validate_banking_relationship_integrity();

DROP TRIGGER IF EXISTS trg_topup_relationship_integrity ON topup_requests;
CREATE TRIGGER trg_topup_relationship_integrity
BEFORE INSERT OR UPDATE ON topup_requests
FOR EACH ROW EXECUTE FUNCTION validate_banking_relationship_integrity();

DROP TRIGGER IF EXISTS trg_transfer_relationship_integrity ON transfer_requests;
CREATE TRIGGER trg_transfer_relationship_integrity
BEFORE INSERT OR UPDATE ON transfer_requests
FOR EACH ROW EXECUTE FUNCTION validate_banking_relationship_integrity();

INSERT INTO schema_migrations(version)
VALUES ('010_account_relationship_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
