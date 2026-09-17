BEGIN;

ALTER TABLE platform_users DROP CONSTRAINT IF EXISTS platform_users_role_check;
ALTER TABLE platform_users ADD CONSTRAINT platform_users_role_check CHECK (role IN ('user','admin','super_admin','operator','editor','moderator','support'));

CREATE TABLE IF NOT EXISTS admin_permissions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  UNIQUE(role,permission)
);

INSERT INTO admin_permissions(role,permission) VALUES
('super_admin','*'),
('admin','users.read'),('admin','content.read'),('admin','content.write'),('admin','content.delete'),('admin','maintenance.write'),('admin','support.read'),('admin','support.write'),('admin','audit.read'),
('operator','users.read'),('operator','content.read'),('operator','support.read'),('operator','support.write'),('operator','financial.review'),('operator','exchange.review'),
('editor','content.read'),('editor','content.write'),
('moderator','content.read'),('moderator','content.moderate'),
('support','users.read'),('support','support.read'),('support','support.write')
ON CONFLICT(role,permission) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_admin_permissions_role ON admin_permissions(role);
INSERT INTO schema_migrations(version) VALUES ('008_permissions') ON CONFLICT(version) DO NOTHING;
COMMIT;
