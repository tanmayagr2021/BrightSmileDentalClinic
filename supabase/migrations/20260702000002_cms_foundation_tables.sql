-- ============================================================
-- Migration: CMS Foundation — content_blocks, media_usage,
-- six new site-content tables, media_library extensions.
-- Phase 1 — Enterprise CMS Foundation. Purely additive.
-- ============================================================

-- ── content_blocks ────────────────────────────────────────
-- Generic key/value store for singular chrome copy (headings,
-- CTA labels, intros, banners) that doesn't belong to any
-- existing entity. `key` uses dot notation, e.g. 'home.hero.headline_line1'.
CREATE TABLE public.content_blocks (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    key          text        NOT NULL UNIQUE,
    value        text        NOT NULL,
    content_type text        NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'richtext')),
    page         text,
    section      text,
    description  text,
    updated_by   uuid        REFERENCES public.admin_users(id),
    created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at   timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_content_blocks
    BEFORE UPDATE ON public.content_blocks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_content_blocks_page_section ON public.content_blocks(page, section);

COMMENT ON TABLE public.content_blocks IS 'Standalone chrome copy (headings, CTAs, intros, banners) not tied to an entity row. Superseded homepage_sections.custom_heading/custom_subheading, which remain unused.';
COMMENT ON COLUMN public.content_blocks.key IS 'Dot-notation key, e.g. home.hero.headline_line1. May contain {placeholder} tokens for simple client-side interpolation.';

-- ── media_library extensions ──────────────────────────────
ALTER TABLE public.media_library
    ADD COLUMN IF NOT EXISTS folder text,
    ADD COLUMN IF NOT EXISTS tags   text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_media_library_tags ON public.media_library USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON public.media_library(folder);

COMMENT ON COLUMN public.media_library.folder IS 'Optional logical grouping for browsing, e.g. doctors, gallery, hero. Not tied to storage bucket structure.';
COMMENT ON COLUMN public.media_library.tags IS 'Free-form tags for search/filter in the Media Library UI.';

-- ── media_usage ────────────────────────────────────────────
-- Tracks which entity row/column currently displays a given
-- media_library asset, so "Replace" can cascade-update every
-- consumer and "Delete" can warn/block when still in use.
-- table_name/column_name are bookkeeping only — the API layer
-- must map them through a static allowlist before ever using
-- them in a dynamic query (service-role client bypasses RLS).
CREATE TABLE public.media_usage (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id     uuid        NOT NULL REFERENCES public.media_library(id) ON DELETE CASCADE,
    table_name   text        NOT NULL,
    column_name  text        NOT NULL,
    record_id    uuid        NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (table_name, column_name, record_id)
);

CREATE INDEX idx_media_usage_media_id ON public.media_usage(media_id);

COMMENT ON TABLE public.media_usage IS 'One row per (table, column, record) slot currently pointing at a media_library asset via a raw URL column. Upserted when an admin picks an image via MediaPicker; used to block/cascade on delete/replace.';

-- ── trust_indicators ───────────────────────────────────────
CREATE TABLE public.trust_indicators (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    description text        NOT NULL,
    sort_order  integer     NOT NULL DEFAULT 0,
    is_visible  boolean     NOT NULL DEFAULT true,
    created_by  uuid        REFERENCES public.admin_users(id),
    updated_by  uuid        REFERENCES public.admin_users(id),
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_trust_indicators
    BEFORE UPDATE ON public.trust_indicators
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── why_choose_reasons ─────────────────────────────────────
CREATE TABLE public.why_choose_reasons (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    description text        NOT NULL,
    sort_order  integer     NOT NULL DEFAULT 0,
    is_visible  boolean     NOT NULL DEFAULT true,
    created_by  uuid        REFERENCES public.admin_users(id),
    updated_by  uuid        REFERENCES public.admin_users(id),
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_why_choose_reasons
    BEFORE UPDATE ON public.why_choose_reasons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── patient_journey_steps ──────────────────────────────────
CREATE TABLE public.patient_journey_steps (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    step        integer     NOT NULL,
    title       text        NOT NULL,
    subtitle    text        NOT NULL,
    description text        NOT NULL,
    sort_order  integer     NOT NULL DEFAULT 0,
    is_visible  boolean     NOT NULL DEFAULT true,
    created_by  uuid        REFERENCES public.admin_users(id),
    updated_by  uuid        REFERENCES public.admin_users(id),
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_patient_journey_steps
    BEFORE UPDATE ON public.patient_journey_steps
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── before_after_cases ─────────────────────────────────────
-- New table — FKs directly to media_library (no legacy raw-URL
-- data to preserve), unlike the media_usage retrofit above.
CREATE TABLE public.before_after_cases (
    id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    title              text        NOT NULL,
    category           text        NOT NULL CHECK (category IN ('smile-makeover', 'orthodontics', 'whitening', 'implants')),
    treatment_details  text        NOT NULL,
    duration           text        NOT NULL,
    before_media_id    uuid        REFERENCES public.media_library(id) ON DELETE RESTRICT,
    after_media_id     uuid        REFERENCES public.media_library(id) ON DELETE RESTRICT,
    before_gradient    text,
    after_gradient     text,
    sort_order         integer     NOT NULL DEFAULT 0,
    is_visible         boolean     NOT NULL DEFAULT true,
    created_by         uuid        REFERENCES public.admin_users(id),
    updated_by         uuid        REFERENCES public.admin_users(id),
    created_at         timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at         timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_before_after_cases
    BEFORE UPDATE ON public.before_after_cases
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.before_after_cases.before_gradient IS 'Fallback placeholder gradient shown until before_media_id/after_media_id are set (patient consent pending).';

-- ── certifications ─────────────────────────────────────────
CREATE TABLE public.certifications (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    issuer      text        NOT NULL,
    year        text        NOT NULL,
    type        text        NOT NULL CHECK (type IN ('registration', 'award', 'certification')),
    image_id    uuid        REFERENCES public.media_library(id) ON DELETE RESTRICT,
    sort_order  integer     NOT NULL DEFAULT 0,
    is_visible  boolean     NOT NULL DEFAULT true,
    created_by  uuid        REFERENCES public.admin_users(id),
    updated_by  uuid        REFERENCES public.admin_users(id),
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_certifications
    BEFORE UPDATE ON public.certifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── team_members ───────────────────────────────────────────
CREATE TABLE public.team_members (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    role        text        NOT NULL,
    department  text        NOT NULL CHECK (department IN ('hygienist', 'assistant', 'reception', 'admin')),
    initials    text,
    color_hex   text,
    photo_id    uuid        REFERENCES public.media_library(id) ON DELETE RESTRICT,
    sort_order  integer     NOT NULL DEFAULT 0,
    is_visible  boolean     NOT NULL DEFAULT true,
    created_by  uuid        REFERENCES public.admin_users(id),
    updated_by  uuid        REFERENCES public.admin_users(id),
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_team_members
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.team_members.initials IS 'Fallback avatar initials when photo_id is not set.';

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE public.content_blocks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_usage            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_indicators       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_choose_reasons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_journey_steps  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.before_after_cases     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read content_blocks"
    ON public.content_blocks FOR SELECT USING (true);
CREATE POLICY "Admin manage content_blocks"
    ON public.content_blocks FOR ALL USING (public.is_admin());

-- media_usage is bookkeeping only — no public access, admin-only.
CREATE POLICY "Admin manage media_usage"
    ON public.media_usage FOR ALL USING (public.is_admin());

CREATE POLICY "Public read visible trust_indicators"
    ON public.trust_indicators FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage trust_indicators"
    ON public.trust_indicators FOR ALL USING (public.is_admin());

CREATE POLICY "Public read visible why_choose_reasons"
    ON public.why_choose_reasons FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage why_choose_reasons"
    ON public.why_choose_reasons FOR ALL USING (public.is_admin());

CREATE POLICY "Public read visible patient_journey_steps"
    ON public.patient_journey_steps FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage patient_journey_steps"
    ON public.patient_journey_steps FOR ALL USING (public.is_admin());

CREATE POLICY "Public read visible before_after_cases"
    ON public.before_after_cases FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage before_after_cases"
    ON public.before_after_cases FOR ALL USING (public.is_admin());

CREATE POLICY "Public read visible certifications"
    ON public.certifications FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage certifications"
    ON public.certifications FOR ALL USING (public.is_admin());

CREATE POLICY "Public read visible team_members"
    ON public.team_members FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage team_members"
    ON public.team_members FOR ALL USING (public.is_admin());
