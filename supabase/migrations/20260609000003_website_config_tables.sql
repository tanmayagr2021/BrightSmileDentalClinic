-- ============================================================
-- Migration 003: Website Configuration Tables
-- All settings are CMS-driven — nothing hardcoded.
-- ============================================================

-- ── site_settings ────────────────────────────────────────
-- Single-row table. All clinic-wide configuration lives here.
CREATE TABLE public.site_settings (
    id                                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_name                       text        NOT NULL DEFAULT 'Bright Smile Dental Clinic Pvt. Ltd.',
    tagline                           text        DEFAULT 'Creating Smiles, Changing Lives',
    phone_primary                     text,
    phone_whatsapp                    text,
    email_general                     text,
    email_appointments                text,
    address_line1                     text,
    address_line2                     text,
    address_city                      text        DEFAULT 'Kathmandu',
    address_country                   text        DEFAULT 'Nepal',
    google_maps_url                   text,
    facebook_url                      text,
    instagram_url                     text,
    youtube_url                       text,
    domain                            text,
    robots_txt                        text        DEFAULT 'User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://placeholder.com/sitemap.xml',
    booking_form_enabled              boolean     NOT NULL DEFAULT true,
    booking_form_closed_message       text        DEFAULT 'Online booking is temporarily unavailable. Please call us to schedule an appointment.',
    review_solicitation_enabled       boolean     NOT NULL DEFAULT false,
    review_solicitation_delay_hours   integer     NOT NULL DEFAULT 24,
    review_gbp_url                    text,
    ga4_measurement_id                text,
    google_search_console_verification text,
    cookie_consent_enabled            boolean     NOT NULL DEFAULT true,
    stat_patients                     integer     NOT NULL DEFAULT 1000,
    stat_years                        integer     NOT NULL DEFAULT 10,
    stat_treatments                   integer     NOT NULL DEFAULT 20,
    stat_team_label                   text        NOT NULL DEFAULT 'Experienced Team',
    -- Enabled locales for i18n routing (future multilingual)
    enabled_locales                   text[]      NOT NULL DEFAULT ARRAY['en'],
    updated_by                        uuid        REFERENCES public.admin_users(id),
    created_at                        timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at                        timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_site_settings
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.site_settings IS 'Single-row clinic configuration table. All settings are CMS-driven.';
COMMENT ON COLUMN public.site_settings.enabled_locales IS 'Controls which language prefixes are active. Add ''ne'' to enable Nepali without code changes.';

-- ── branding ─────────────────────────────────────────────
CREATE TABLE public.branding (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id          uuid        NOT NULL UNIQUE REFERENCES public.site_settings(id) ON DELETE CASCADE,
    logo_url         text,
    logo_dark_url    text,
    favicon_url      text,
    color_primary    text        NOT NULL DEFAULT '#4A9B6F',
    color_primary_dark text      NOT NULL DEFAULT '#3d8560',
    color_dark       text        NOT NULL DEFAULT '#1A3D2B',
    color_tint       text        NOT NULL DEFAULT '#F0F7F2',
    color_text       text        NOT NULL DEFAULT '#1C1C1E',
    updated_by       uuid        REFERENCES public.admin_users(id),
    created_at       timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_branding
    BEFORE UPDATE ON public.branding
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.branding IS '1:1 with site_settings. Stores brand colors and asset URLs.';

-- ── opening_hours ─────────────────────────────────────────
-- 7 rows seeded (one per day of week).
CREATE TABLE public.opening_hours (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week  integer     NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    is_open      boolean     NOT NULL DEFAULT true,
    open_time    time,
    close_time   time,
    updated_by   uuid        REFERENCES public.admin_users(id),
    created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at   timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_opening_hours
    BEFORE UPDATE ON public.opening_hours
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.opening_hours.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';

-- ── homepage_sections ─────────────────────────────────────
CREATE TABLE public.homepage_sections (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key      text        NOT NULL UNIQUE,
    is_visible       boolean     NOT NULL DEFAULT true,
    sort_order       integer     NOT NULL DEFAULT 0,
    custom_heading   text,
    custom_subheading text,
    updated_by       uuid        REFERENCES public.admin_users(id),
    created_at       timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_homepage_sections
    BEFORE UPDATE ON public.homepage_sections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.homepage_sections.section_key IS 'hero | services | doctors | stats | testimonials | faq | gallery_preview | cta';

-- ── seo_settings ──────────────────────────────────────────
-- One row per page slug. Also used for per-service and per-doctor overrides.
CREATE TABLE public.seo_settings (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                text        NOT NULL UNIQUE,
    meta_title          text,
    meta_description    text,
    og_image_url        text,
    canonical_override  text,
    is_noindex          boolean     NOT NULL DEFAULT false,
    updated_by          uuid        REFERENCES public.admin_users(id),
    created_at          timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at          timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_seo_settings
    BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.seo_settings.slug IS 'Page path slug: home | about | services | services/{slug} | doctors | faq | gallery | contact | blog | privacy';

-- ── contact_submissions ───────────────────────────────────
CREATE TABLE public.contact_submissions (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    email       text        NOT NULL,
    phone       text,
    message     text        NOT NULL,
    is_read     boolean     NOT NULL DEFAULT false,
    read_by     uuid        REFERENCES public.admin_users(id),
    read_at     timestamptz,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_contact_submissions
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
