BEGIN;

INSERT INTO admin_permissions(role,permission) VALUES
('admin','ai.execute'),('admin','ai.runs.read'),
('super_admin','ai.execute'),('super_admin','ai.runs.read'),
('operator','ai.execute'),('operator','ai.runs.read'),
('editor','ai.execute'),('editor','ai.runs.read'),
('moderator','ai.execute'),('moderator','ai.runs.read')
ON CONFLICT(role,permission) DO NOTHING;

INSERT INTO schema_migrations(version)
VALUES ('023_ai_permissions')
ON CONFLICT(version) DO NOTHING;

COMMIT;
