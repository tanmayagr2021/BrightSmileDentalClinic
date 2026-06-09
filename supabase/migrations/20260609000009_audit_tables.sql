-- ============================================================
-- Migration 009: Audit and Versioning Tables
-- All append-only. No UPDATE or DELETE for any role.
-- ============================================================

-- ── audit_log ────────────────────────────────────────────
-- General admin action log. Covers all non-medical resources.
CREATE TABLE public.audit_log (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id     uuid        REFERENCES public.admin_users(id) ON DELETE SET NULL,
    action       text        NOT NULL,   -- e.g. 'create', 'update', 'delete', 'login'
    resource     text        NOT NULL,   -- table name or resource key
    resource_id  text,                   -- affected row ID (text for flexibility)
    old_data     jsonb,                  -- row state before change
    new_data     jsonb,                  -- row state after change
    ip_address   inet,
    user_agent   text,
    created_at   timestamptz NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.audit_log IS 'Append-only general audit trail. INSERT only — no UPDATE or DELETE for any role.';
COMMENT ON COLUMN public.audit_log.old_data IS 'Snapshot of the row before the action. NULL for creates.';
COMMENT ON COLUMN public.audit_log.new_data IS 'Snapshot of the row after the action. NULL for deletes.';

-- ── medical_history_access_log ────────────────────────────
-- Compliance log: every access to medical_histories is recorded.
CREATE TABLE public.medical_history_access_log (
    id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_history_id    uuid        NOT NULL REFERENCES public.medical_histories(id) ON DELETE RESTRICT,
    accessed_by           uuid        NOT NULL REFERENCES public.admin_users(id) ON DELETE RESTRICT,
    access_type           text        NOT NULL CHECK (access_type IN ('view', 'create', 'update', 'decrypt')),
    fields_accessed       text[],     -- Which vault fields were decrypted
    ip_address            inet,
    accessed_at           timestamptz NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.medical_history_access_log IS 'Compliance audit log for medical history access. Append-only. ON DELETE RESTRICT prevents orphaned records.';
COMMENT ON COLUMN public.medical_history_access_log.fields_accessed IS 'e.g. ARRAY[''allergies'', ''current_medications''] — the specific vault fields that were decrypted.';

-- ── content_versions ─────────────────────────────────────
-- Stores last 10 versions of editable content entities.
-- Pruning to 10 is enforced at application layer.
CREATE TABLE public.content_versions (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type   text        NOT NULL,  -- e.g. 'blog_post', 'service', 'doctor'
    entity_id     uuid        NOT NULL,
    version       integer     NOT NULL,
    data          jsonb       NOT NULL,  -- Full serialized row snapshot
    created_by    uuid        REFERENCES public.admin_users(id) ON DELETE SET NULL,
    created_at    timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (entity_type, entity_id, version)
);

COMMENT ON TABLE public.content_versions IS 'Stores up to 10 prior versions per entity for rollback. Pruning enforced at app layer.';
COMMENT ON COLUMN public.content_versions.data IS 'Full JSON snapshot of the entity at this version.';
