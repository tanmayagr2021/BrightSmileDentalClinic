-- ============================================================
-- Migration 008: Blog Tables
-- Blog is built in from day one but not launched at go-live.
-- Visibility controlled via homepage_sections.is_visible.
-- ============================================================

-- ── blog_categories ───────────────────────────────────────
CREATE TABLE public.blog_categories (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    slug        text        NOT NULL UNIQUE,
    description text,
    sort_order  integer     NOT NULL DEFAULT 0,
    created_by  uuid        REFERENCES public.admin_users(id),
    updated_by  uuid        REFERENCES public.admin_users(id),
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_blog_categories
    BEFORE UPDATE ON public.blog_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── blog_posts ────────────────────────────────────────────
CREATE TABLE public.blog_posts (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    title            text        NOT NULL,
    slug             text        NOT NULL UNIQUE,
    excerpt          text,
    content          text,       -- Rich text / MDX
    cover_image_url  text,
    author_id        uuid        REFERENCES public.admin_users(id) ON DELETE SET NULL,
    status           text        NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft', 'published', 'archived')),
    published_at     timestamptz,
    -- SEO inline
    meta_title       text,
    meta_description text,
    og_image_url     text,
    read_time_minutes integer,
    is_featured      boolean     NOT NULL DEFAULT false,
    sort_order       integer     NOT NULL DEFAULT 0,
    created_by       uuid        REFERENCES public.admin_users(id),
    updated_by       uuid        REFERENCES public.admin_users(id),
    deleted_at       timestamptz,
    created_at       timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_blog_posts
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.blog_posts.published_at IS 'NULL until first publish. Supports scheduled publishing (future date).';
COMMENT ON COLUMN public.blog_posts.deleted_at IS 'Soft delete. Deleted posts return 410 Gone for SEO.';

-- ── blog_posts_categories ─────────────────────────────────
CREATE TABLE public.blog_posts_categories (
    post_id     uuid NOT NULL REFERENCES public.blog_posts(id)       ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES public.blog_categories(id)  ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (post_id, category_id)
);

-- ── newsletter_subscribers ────────────────────────────────
CREATE TABLE public.newsletter_subscribers (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    email          text        NOT NULL UNIQUE,
    name           text,
    is_active      boolean     NOT NULL DEFAULT true,
    subscribed_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    unsubscribed_at timestamptz,
    source         text        NOT NULL DEFAULT 'website'
                       CHECK (source IN ('website', 'admin', 'import')),
    created_at     timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at     timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_newsletter_subscribers
    BEFORE UPDATE ON public.newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.newsletter_subscribers.unsubscribed_at IS 'NULL = currently subscribed. Set when is_active → false for audit trail.';
