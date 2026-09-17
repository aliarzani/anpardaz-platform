BEGIN;

INSERT INTO admin_permissions(role,permission) VALUES
('admin','approvals.read'),('admin','approvals.write'),('admin','reconciliation.read'),('admin','reconciliation.write'),('admin','service_health.read'),('admin','ai.providers.read'),('admin','notifications.write'),
('super_admin','approvals.read'),('super_admin','approvals.write'),('super_admin','reconciliation.read'),('super_admin','reconciliation.write'),('super_admin','service_health.read'),('super_admin','ai.providers.read'),('super_admin','notifications.write'),
('operator','approvals.read'),('operator','approvals.write'),('operator','reconciliation.read'),('operator','reconciliation.write'),('operator','service_health.read'),('operator','ai.providers.read'),
('support','service_health.read'),('support','notifications.write')
ON CONFLICT(role,permission) DO NOTHING;

INSERT INTO schema_migrations(version) VALUES('019_admin_permissions') ON CONFLICT(version) DO NOTHING;
COMMIT;
