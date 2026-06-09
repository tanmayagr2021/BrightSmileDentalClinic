-- ============================================================
-- Migration 002: Admin Tables
-- Created first — referenced by created_by/updated_by in
-- all subsequent tables.
-- ============================================================

-- ── roles ────────────────────────────────────────────────
CREATE TABLE public.roles (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL UNIQUE,
    description text,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_roles
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.roles IS 'Admin role definitions. Seeded with super_admin and admin.';

-- ── permissions ──────────────────────────────────────────
CREATE TABLE public.permissions (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    resource    text        NOT NULL,
    action      text        NOT NULL,
    description text,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (resource, action)
);

CREATE TRIGGER set_updated_at_permissions
    BEFORE UPDATE ON public.permissions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.permissions IS 'Resource.action permission pairs. Seeded at initialization.';

-- ── role_permissions ─────────────────────────────────────
CREATE TABLE public.role_permissions (
    role_id       uuid NOT NULL REFERENCES public.roles(id)       ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at    timestamptz NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (role_id, permission_id)
);

COMMENT ON TABLE public.role_permissions IS 'Junction: assigns permissions to roles.';

-- ── admin_users ──────────────────────────────────────────
-- id matches auth.users.id — no separate UUID generated.
CREATE TABLE public.admin_users (
    id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           text        NOT NULL UNIQUE,
    full_name       text        NOT NULL,
    role_id         uuid        NOT NULL REFERENCES public.roles(id),
    is_active       boolean     NOT NULL DEFAULT true,
    invited_by      uuid        REFERENCES public.admin_users(id),
    created_by      uuid        REFERENCES public.admin_users(id),
    updated_by      uuid        REFERENCES public.admin_users(id),
    last_sign_in_at timestamptz,
    deleted_at      timestamptz,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_admin_users
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.admin_users IS 'Clinic admin accounts. Linked 1:1 to Supabase Auth users.';
COMMENT ON COLUMN public.admin_users.deleted_at IS 'Soft delete — deactivated accounts are preserved for audit history.';
