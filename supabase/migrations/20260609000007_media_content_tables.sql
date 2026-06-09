-- ============================================================
-- Migration 007: Media and Content Tables
-- ============================================================

-- ── media_library ────────────────────────────────────────
CREATE TABLE public.media_library (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket       text        NOT NULL,   -- Storage bucket name
    file_path    text        NOT NULL UNIQUE,
    file_name    text        NOT NULL,
    file_size    bigint,
    mime_type    text,
    alt_text     text,
    caption      text,
    width        integer,
    height       integer,
    is_deleted   boolean     NOT NULL DEFAULT false,
    uploaded_by  uuid        REFERENCES public.admin_users(id),
    created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at   timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_media_library
    BEFORE UPDATE ON public.media_library
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.media_library.is_deleted IS 'Soft delete. Preserves file path references in content that may still point to this asset.';
COMMENT ON COLUMN public.media_library.file_path IS 'Relative path within the storage bucket, e.g. uuid/filename.jpg';

-- ── gallery_groups ────────────────────────────────────────
CREATE TABLE public.gallery_groups (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    slug        text        NOT NULL UNIQUE,
    description text,
    sort_order  integer     NOT NULL DEFAULT 0,
    is_visible  boolean     NOT NULL DEFAULT true,
    created_by  uuid        REFERENCES public.admin_users(id),
    updated_by  uuid        REFERENCES public.admin_users(id),
    deleted_at  timestamptz,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_gallery_groups
    BEFORE UPDATE ON public.gallery_groups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── gallery ───────────────────────────────────────────────
CREATE TABLE public.gallery (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id         uuid        REFERENCES public.gallery_groups(id) ON DELETE SET NULL,
    image_url        text        NOT NULL,
    thumbnail_url    text,
    alt_text         text        NOT NULL,
    caption          text,
    sort_order       integer     NOT NULL DEFAULT 0,
    is_visible       boolean     NOT NULL DEFAULT true,
    is_featured      boolean     NOT NULL DEFAULT false,
    created_by       uuid        REFERENCES public.admin_users(id),
    updated_by       uuid        REFERENCES public.admin_users(id),
    deleted_at       timestamptz,
    created_at       timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_gallery
    BEFORE UPDATE ON public.gallery
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── testimonials ──────────────────────────────────────────
CREATE TABLE public.testimonials (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name    text        NOT NULL,
    patient_initials text,      -- e.g. "R.S." for display when no photo
    rating          integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text     text        NOT NULL,
    treatment_type  text,
    source          text        NOT NULL DEFAULT 'manual'
                        CHECK (source IN ('manual', 'google', 'facebook')),
    source_url      text,
    is_featured     boolean     NOT NULL DEFAULT false,
    sort_order      integer     NOT NULL DEFAULT 0,
    status          text        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by     uuid        REFERENCES public.admin_users(id),
    approved_at     timestamptz,
    created_by      uuid        REFERENCES public.admin_users(id),
    updated_by      uuid        REFERENCES public.admin_users(id),
    deleted_at      timestamptz,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_testimonials
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.testimonials.status IS 'pending = awaiting review, approved = visible on site, rejected = hidden';

-- ── faqs ──────────────────────────────────────────────────
CREATE TABLE public.faqs (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    question    text        NOT NULL,
    answer      text        NOT NULL,    -- Rich text
    category    text,
    sort_order  integer     NOT NULL DEFAULT 0,
    is_visible  boolean     NOT NULL DEFAULT true,
    created_by  uuid        REFERENCES public.admin_users(id),
    updated_by  uuid        REFERENCES public.admin_users(id),
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_faqs
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
