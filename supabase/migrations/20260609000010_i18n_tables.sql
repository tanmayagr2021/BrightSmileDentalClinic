-- ============================================================
-- Migration 010: Internationalization Tables
-- i18n-ready schema for future Nepali (ne) expansion.
-- No Nepali content at launch — architecture supports it.
-- ============================================================

-- ── content_translations ─────────────────────────────────
-- Entity-agnostic translation store. Add a new row per field
-- per language without any schema changes.
CREATE TABLE public.content_translations (
    id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type       text        NOT NULL,   -- e.g. 'service', 'doctor', 'faq', 'blog_post'
    entity_id         uuid        NOT NULL,
    language_code     text        NOT NULL,   -- ISO 639-1: 'en', 'ne'
    field_name        text        NOT NULL,   -- e.g. 'name', 'description', 'short_bio'
    translated_value  text        NOT NULL,
    created_by        uuid        REFERENCES public.admin_users(id),
    updated_by        uuid        REFERENCES public.admin_users(id),
    created_at        timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at        timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (entity_type, entity_id, language_code, field_name)
);

CREATE TRIGGER set_updated_at_content_translations
    BEFORE UPDATE ON public.content_translations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.content_translations IS 'Entity-agnostic translation table. Query by (entity_type, entity_id, language_code) to fetch all translated fields for an entity. Active languages controlled by site_settings.enabled_locales.';
COMMENT ON COLUMN public.content_translations.language_code IS 'ISO 639-1. Currently only ''en'' is active at launch. Add ''ne'' to site_settings.enabled_locales to activate Nepali routing.';
COMMENT ON COLUMN public.content_translations.field_name IS 'Dot-notation field path matching the column or logical field on the parent entity.';
