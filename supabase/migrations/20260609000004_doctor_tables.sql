-- ============================================================
-- Migration 004: Doctor Tables
-- ============================================================

-- ── doctors ───────────────────────────────────────────────
CREATE TABLE public.doctors (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           text        NOT NULL,
    slug                text        NOT NULL UNIQUE,
    title               text,
    nmc_number          text,
    short_bio           text,        -- Max 200 chars recommended; enforced at app layer
    full_bio            text,        -- Rich text
    profile_image_url   text,
    is_active           boolean     NOT NULL DEFAULT true,
    sort_order          integer     NOT NULL DEFAULT 0,
    created_by          uuid        REFERENCES public.admin_users(id),
    updated_by          uuid        REFERENCES public.admin_users(id),
    deleted_at          timestamptz,
    created_at          timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at          timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_doctors
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.doctors.deleted_at IS 'Soft delete. Deleted doctors are hidden from public but preserved for appointment history.';
COMMENT ON COLUMN public.doctors.nmc_number IS 'Nepal Medical Council registration number. Displayed publicly for trust signals.';

-- ── doctor_qualifications ─────────────────────────────────
CREATE TABLE public.doctor_qualifications (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id      uuid        NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    degree         text        NOT NULL,
    institution    text,
    year_obtained  integer,
    sort_order     integer     NOT NULL DEFAULT 0,
    created_by     uuid        REFERENCES public.admin_users(id),
    updated_by     uuid        REFERENCES public.admin_users(id),
    created_at     timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at     timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_doctor_qualifications
    BEFORE UPDATE ON public.doctor_qualifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── doctor_availability ───────────────────────────────────
-- One row per doctor per day of week.
CREATE TABLE public.doctor_availability (
    id                         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id                  uuid        NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day_of_week                integer     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_available               boolean     NOT NULL DEFAULT true,
    start_time                 time,
    end_time                   time,
    slot_duration_minutes      integer     NOT NULL DEFAULT 30,
    max_appointments_per_day   integer,
    updated_by                 uuid        REFERENCES public.admin_users(id),
    created_at                 timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at                 timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (doctor_id, day_of_week)
);

CREATE TRIGGER set_updated_at_doctor_availability
    BEFORE UPDATE ON public.doctor_availability
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── blocked_dates ─────────────────────────────────────────
-- Specific dates a doctor is unavailable (leave, conferences, etc.)
CREATE TABLE public.blocked_dates (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id    uuid        NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    blocked_date date        NOT NULL,
    reason       text,        -- Internal only, not shown publicly
    created_by   uuid        REFERENCES public.admin_users(id),
    created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (doctor_id, blocked_date)
);

CREATE TRIGGER set_updated_at_blocked_dates
    BEFORE UPDATE ON public.blocked_dates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
