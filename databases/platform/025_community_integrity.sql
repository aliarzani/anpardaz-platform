BEGIN;

CREATE OR REPLACE FUNCTION validate_community_comment_parent()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_target_type TEXT; parent_target_id TEXT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.parent_id = NEW.id THEN
    RAISE EXCEPTION 'comment_cannot_parent_itself';
  END IF;

  SELECT target_type,target_id
    INTO parent_target_type,parent_target_id
    FROM community_comments
   WHERE id=NEW.parent_id;

  IF parent_target_type IS NULL THEN
    RAISE EXCEPTION 'comment_parent_not_found';
  END IF;

  IF parent_target_type <> NEW.target_type OR parent_target_id <> NEW.target_id THEN
    RAISE EXCEPTION 'comment_parent_target_mismatch';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_community_comment_parent ON community_comments;
CREATE TRIGGER trg_community_comment_parent
BEFORE INSERT OR UPDATE OF parent_id,target_type,target_id ON community_comments
FOR EACH ROW EXECUTE FUNCTION validate_community_comment_parent();

CREATE OR REPLACE FUNCTION validate_community_report_status_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status AND NOT (
    (OLD.status='open' AND NEW.status IN ('reviewing','resolved','rejected')) OR
    (OLD.status='reviewing' AND NEW.status IN ('resolved','rejected','open')) OR
    (OLD.status IN ('resolved','rejected') AND NEW.status=OLD.status)
  ) THEN
    RAISE EXCEPTION 'invalid_report_status_transition:%->%', OLD.status, NEW.status;
  END IF;

  IF NEW.status IN ('resolved','rejected') THEN
    IF NEW.resolved_by IS NULL THEN
      RAISE EXCEPTION 'report_resolver_required';
    END IF;
    IF NEW.resolved_at IS NULL THEN
      NEW.resolved_at := NOW();
    END IF;
  ELSE
    NEW.resolved_by := NULL;
    NEW.resolved_at := NULL;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_community_report_status ON community_reports;
CREATE TRIGGER trg_community_report_status
BEFORE UPDATE OF status,resolution,resolved_by,resolved_at ON community_reports
FOR EACH ROW EXECUTE FUNCTION validate_community_report_status_transition();

CREATE INDEX IF NOT EXISTS idx_comments_parent_created
  ON community_comments(parent_id,created_at);

INSERT INTO schema_migrations(version)
VALUES('025_community_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
