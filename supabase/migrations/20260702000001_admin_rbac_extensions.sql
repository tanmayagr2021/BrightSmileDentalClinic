-- Activate the existing (previously unused) admin_users/roles/audit_log schema
-- for multi-admin management. Adds the two columns the app-layer feature needs
-- that weren't in the original schema.

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS phone_number text;

ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS success boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.audit_log.success IS 'False for failed/denied actions (e.g. permission-denied attempts), so those are visible in the audit trail too.';
