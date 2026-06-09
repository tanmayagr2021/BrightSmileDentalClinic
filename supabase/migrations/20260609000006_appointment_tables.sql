-- ============================================================
-- Migration 006: Appointment Tables
-- ============================================================

-- ── appointments ─────────────────────────────────────────
CREATE TABLE public.appointments (
    id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Patient info (collected at booking time, denormalized for history durability)
    patient_name          text        NOT NULL,
    patient_email         text        NOT NULL,
    patient_phone         text        NOT NULL,
    -- Booking details
    doctor_id             uuid        REFERENCES public.doctors(id) ON DELETE SET NULL,
    service_id            uuid        REFERENCES public.services(id) ON DELETE SET NULL,
    appointment_date      date        NOT NULL,
    appointment_time      time        NOT NULL,
    duration_minutes      integer     NOT NULL DEFAULT 30,
    -- Status
    status                text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show')),
    -- Patient notes
    notes                 text,
    -- Admin fields
    is_new_patient        boolean     NOT NULL DEFAULT true,
    reminder_sent         boolean     NOT NULL DEFAULT false,
    reminder_sent_at      timestamptz,
    review_email_sent     boolean     NOT NULL DEFAULT false,
    review_email_sent_at  timestamptz,
    -- Source tracking
    source                text        NOT NULL DEFAULT 'website'
                              CHECK (source IN ('website', 'phone', 'walk_in', 'admin')),
    -- Admin management
    assigned_to           uuid        REFERENCES public.admin_users(id),
    created_by            uuid        REFERENCES public.admin_users(id),
    updated_by            uuid        REFERENCES public.admin_users(id),
    created_at            timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at            timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_appointments
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Status change auto-logging trigger (function defined in migration 001)
CREATE TRIGGER log_appointment_status
    AFTER UPDATE OF status ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.log_appointment_status_change();

COMMENT ON COLUMN public.appointments.status IS 'pending → confirmed → completed | rescheduled | cancelled | no_show';
COMMENT ON COLUMN public.appointments.source IS 'Tracks how the appointment was created for analytics.';

-- ── medical_histories ─────────────────────────────────────
-- 5 fields encrypted via Supabase Vault at application layer.
-- The actual encrypted values are stored as vault secret IDs.
CREATE TABLE public.medical_histories (
    id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id              uuid        NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    -- These columns store Supabase Vault secret IDs (not plaintext)
    allergies_vault_id          text,
    current_medications_vault_id text,
    medical_conditions_vault_id text,
    previous_dental_work_vault_id text,
    emergency_contact_vault_id  text,
    -- Non-sensitive flags stored directly
    is_pregnant                 boolean,
    has_dental_anxiety          boolean,
    updated_by                  uuid        REFERENCES public.admin_users(id),
    created_at                  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at                  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_medical_histories
    BEFORE UPDATE ON public.medical_histories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.medical_histories.allergies_vault_id IS 'Supabase Vault secret ID. Decrypt via vault.decrypted_secrets view in service-role context only.';
COMMENT ON COLUMN public.medical_histories.emergency_contact_vault_id IS 'Supabase Vault secret ID storing JSON: {name, phone, relationship}.';

-- ── appointment_notes ─────────────────────────────────────
-- Admin-only internal notes on an appointment
CREATE TABLE public.appointment_notes (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid        NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    note           text        NOT NULL,
    is_internal    boolean     NOT NULL DEFAULT true,
    created_by     uuid        NOT NULL REFERENCES public.admin_users(id),
    created_at     timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at     timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_appointment_notes
    BEFORE UPDATE ON public.appointment_notes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── appointment_tokens ────────────────────────────────────
-- CSPRNG 64-char hex tokens for patient self-cancellation links
CREATE TABLE public.appointment_tokens (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid        NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    token          text        NOT NULL UNIQUE,
    token_type     text        NOT NULL DEFAULT 'cancellation'
                       CHECK (token_type IN ('cancellation', 'reschedule')),
    expires_at     timestamptz NOT NULL DEFAULT (timezone('utc', now()) + interval '72 hours'),
    used_at        timestamptz,
    created_at     timestamptz NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON COLUMN public.appointment_tokens.token IS '64-char hex CSPRNG token. Single-use: set used_at when consumed.';
COMMENT ON COLUMN public.appointment_tokens.expires_at IS '72-hour TTL from creation.';

-- ── appointment_status_history ────────────────────────────
-- Append-only. Auto-populated by log_appointment_status_change() trigger.
-- No UPDATE or DELETE is permitted for any role (enforced by RLS).
CREATE TABLE public.appointment_status_history (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      uuid        NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    old_status          text,
    new_status          text        NOT NULL,
    changed_by          uuid        REFERENCES public.admin_users(id),
    changed_by_patient  boolean     NOT NULL DEFAULT false,
    changed_at          timestamptz NOT NULL DEFAULT timezone('utc', now())
);

COMMENT ON TABLE public.appointment_status_history IS 'Append-only audit trail for appointment status transitions. Populated by trigger.';
COMMENT ON COLUMN public.appointment_status_history.changed_by_patient IS 'True when the change was made via a cancellation token (no admin JWT).';
