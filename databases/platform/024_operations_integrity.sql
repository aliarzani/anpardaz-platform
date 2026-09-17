BEGIN;

CREATE OR REPLACE FUNCTION validate_approval_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status AND NOT (
    (OLD.status='pending' AND NEW.status IN ('approved','rejected','cancelled')) OR
    (OLD.status='approved' AND NEW.status IN ('executed','failed')) OR
    (OLD.status IN ('rejected','executed','failed','cancelled') AND NEW.status=OLD.status)
  ) THEN
    RAISE EXCEPTION 'invalid_approval_status_transition:%->%', OLD.status, NEW.status;
  END IF;

  IF NEW.status IN ('approved','rejected') AND NEW.approver_identity_id IS NULL THEN
    RAISE EXCEPTION 'approval_decider_required';
  END IF;

  IF NEW.status IN ('approved','rejected') AND NEW.approver_identity_id = NEW.requester_identity_id THEN
    RAISE EXCEPTION 'approval_self_approval_forbidden';
  END IF;

  IF NEW.status IN ('approved','rejected','cancelled') AND NEW.decided_at IS NULL THEN
    NEW.decided_at := NOW();
  END IF;

  IF NEW.status IN ('executed','failed') AND NEW.executed_at IS NULL THEN
    NEW.executed_at := NOW();
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_approval_integrity ON approval_requests;
CREATE TRIGGER trg_approval_integrity
BEFORE UPDATE ON approval_requests
FOR EACH ROW EXECUTE FUNCTION validate_approval_integrity();

CREATE INDEX IF NOT EXISTS idx_approval_requester_created
  ON approval_requests(requester_identity_id,created_at DESC);

INSERT INTO schema_migrations(version)
VALUES('024_operations_integrity')
ON CONFLICT(version) DO NOTHING;

COMMIT;
