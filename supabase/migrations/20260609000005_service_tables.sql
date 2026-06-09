-- ============================================================
-- Migration 005: Service Tables
-- ============================================================

-- ── service_categories ───────────────────────────────────
CREATE TABLE public.service_categories (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    slug        text        NOT NULL UNIQUE,
    description text,
    icon_name   text,        -- Lucide icon name, resolved in UI
    sort_order  integer     NOT NULL DEFAULT 0,
    is_visible  boolean     NOT NULL DEFAULT true,
    created_by  uuid        REFERENCES public.admin_users(id),
    updated_by  uuid        REFERENCES public.admin_users(id),
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_service_categories
    BEFORE UPDATE ON public.service_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── services ─────────────────────────────────────────────
CREATE TABLE public.services (
    id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id          uuid        REFERENCES public.service_categories(id) ON DELETE SET NULL,
    name                 text        NOT NULL,
    slug                 text        NOT NULL UNIQUE,
    short_description    text,
    full_description     text,        -- Rich text
    thumbnail_url        text,
    banner_url           text,
    duration_minutes     integer,
    price_from           numeric(10,2),
    price_to             numeric(10,2),
    price_currency       text        NOT NULL DEFAULT 'NPR',
    is_active            boolean     NOT NULL DEFAULT true,
    is_featured          boolean     NOT NULL DEFAULT false,
    sort_order           integer     NOT NULL DEFAULT 0,
    -- SEO inline
    meta_title           text,
    meta_description     text,
    created_by           uuid        REFERENCES public.admin_users(id),
    updated_by           uuid        REFERENCES public.admin_users(id),
    deleted_at           timestamptz,
    created_at           timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at           timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_services
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.services.deleted_at IS 'Soft delete. Deleted services are hidden from public but preserved for appointment history.';
COMMENT ON COLUMN public.services.price_currency IS 'ISO 4217 currency code. Default NPR for Nepalese Rupee.';

-- ── doctor_services ───────────────────────────────────────
-- Which services each doctor performs
CREATE TABLE public.doctor_services (
    doctor_id   uuid NOT NULL REFERENCES public.doctors(id)   ON DELETE CASCADE,
    service_id  uuid NOT NULL REFERENCES public.services(id)  ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (doctor_id, service_id)
);

COMMENT ON TABLE public.doctor_services IS 'Junction: links doctors to services they provide.';
