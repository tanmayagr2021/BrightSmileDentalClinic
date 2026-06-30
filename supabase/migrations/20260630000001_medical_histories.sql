-- ============================================================
-- Migration: Medical Histories & AI Chat Logs
-- Supports the Bright AI medical history wizard and admin CMS module
-- ============================================================

-- ── medical_histories ─────────────────────────────────────────
CREATE TABLE public.medical_histories (
    id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id            text        NOT NULL,
    patient_name          text        NOT NULL,
    patient_age           text,
    patient_gender        text        CHECK (patient_gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    patient_phone         text,
    patient_email         text,
    chief_complaint       text,
    medical_conditions    text[]      NOT NULL DEFAULT '{}',
    allergies             text[]      NOT NULL DEFAULT '{}',
    current_medications   text,
    last_dental_visit     text,
    previous_treatments   text,
    dental_anxiety_level  text        CHECK (dental_anxiety_level IN ('none', 'mild', 'moderate', 'severe')),
    appointment_id        uuid        REFERENCES public.appointments(id) ON DELETE SET NULL,
    status                text        NOT NULL DEFAULT 'pending'
                                      CHECK (status IN ('pending', 'reviewed', 'attached')),
    submitted_at          timestamptz NOT NULL DEFAULT timezone('utc', now()),
    reviewed_at           timestamptz,
    reviewed_by           uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_notes           text,
    created_at            timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at            timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_medical_histories
    BEFORE UPDATE ON public.medical_histories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_medical_histories_session_id    ON public.medical_histories (session_id);
CREATE INDEX idx_medical_histories_status        ON public.medical_histories (status);
CREATE INDEX idx_medical_histories_submitted_at  ON public.medical_histories (submitted_at DESC);
CREATE INDEX idx_medical_histories_appointment   ON public.medical_histories (appointment_id) WHERE appointment_id IS NOT NULL;

COMMENT ON TABLE public.medical_histories IS 'Patient medical histories submitted via the Bright AI wizard.';

-- ── ai_chat_logs ──────────────────────────────────────────────
CREATE TABLE public.ai_chat_logs (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  text        NOT NULL,
    role        text        NOT NULL CHECK (role IN ('user', 'assistant')),
    content     text        NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_ai_chat_logs_session_id  ON public.ai_chat_logs (session_id);
CREATE INDEX idx_ai_chat_logs_created_at  ON public.ai_chat_logs (created_at DESC);

COMMENT ON TABLE public.ai_chat_logs IS 'Bright AI conversation log for analytics. No PII stored beyond session scope.';

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.medical_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_logs      ENABLE ROW LEVEL SECURITY;

-- Public can INSERT their own history (no auth required)
CREATE POLICY "public_insert_medical_histories"
    ON public.medical_histories FOR INSERT
    WITH CHECK (true);

-- Service role reads everything (used in admin API routes)
-- Admins see all records through service role client — no user-level SELECT policy needed

-- Public can INSERT chat logs
CREATE POLICY "public_insert_ai_chat_logs"
    ON public.ai_chat_logs FOR INSERT
    WITH CHECK (true);
