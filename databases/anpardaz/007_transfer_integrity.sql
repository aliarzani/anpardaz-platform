BEGIN;

ALTER TABLE transfer_requests
  DROP CONSTRAINT IF EXISTS transfer_requests_check;

ALTER TABLE transfer_requests
  ADD CONSTRAINT transfer_requests_exactly_one_destination
  CHECK ((destination_account_id IS NOT NULL) <> (destination_external IS NOT NULL));

ALTER TABLE transfer_requests
  ADD CONSTRAINT transfer_requests_external_destination_nonempty
  CHECK (destination_external IS NULL OR length(btrim(destination_external)) > 0);

CREATE INDEX IF NOT EXISTS idx_transfer_destination_account ON transfer_requests(destination_account_id,created_at DESC);

INSERT INTO schema_migrations(version) VALUES('007_transfer_integrity') ON CONFLICT(version) DO NOTHING;
COMMIT;
