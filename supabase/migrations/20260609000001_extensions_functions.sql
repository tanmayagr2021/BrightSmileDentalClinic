-- ============================================================
-- Migration 001: Extensions and Shared Functions
-- ============================================================

-- Required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────
-- Shared trigger function: auto-update updated_at column
-- Applied to every table that has an updated_at column.
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;

-- ──────────────────────────────────────────────────────────
-- Trigger function: auto-track appointment status changes
-- Inserts a row into appointment_status_history on every
-- status column update. Defined here; table created later.
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_appointment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.appointment_status_history (
            appointment_id,
            old_status,
            new_status,
            changed_by,
            changed_by_patient
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid(),
            (auth.uid() IS NULL)
        );
    END IF;
    RETURN NEW;
END;
$$;

-- ──────────────────────────────────────────────────────────
-- RLS helper: is the current JWT a valid active admin?
-- SECURITY DEFINER: runs as function owner, not caller.
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
          AND is_active = true
          AND deleted_at IS NULL
    );
END;
$$;

-- ──────────────────────────────────────────────────────────
-- RLS helper: is the current JWT a super_admin?
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.admin_users au
        JOIN public.roles r ON r.id = au.role_id
        WHERE au.id = auth.uid()
          AND au.is_active = true
          AND au.deleted_at IS NULL
          AND r.name = 'super_admin'
    );
END;
$$;
