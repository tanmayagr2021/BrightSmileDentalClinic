-- ============================================================
-- Migration 011: Storage Buckets
-- 9 buckets. All public read, admin write only.
-- File paths use UUID prefixes to prevent enumeration.
-- ============================================================

-- ── Create buckets ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('doctor-photos',   'doctor-photos',   true, 5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('service-images',  'service-images',  true, 5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('gallery',         'gallery',         true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('blog-images',     'blog-images',     true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('testimonial-photos', 'testimonial-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('branding',        'branding',        true, 2097152,  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/svg+xml']),
    ('og-images',       'og-images',       true, 5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('documents',       'documents',       false, 20971520, ARRAY['application/pdf']),
    ('misc',            'misc',            false, 5242880,  NULL)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS policies ──────────────────────────────────

-- Allow public read on all public buckets
CREATE POLICY "Public read — doctor-photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'doctor-photos');

CREATE POLICY "Public read — service-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'service-images');

CREATE POLICY "Public read — gallery"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gallery');

CREATE POLICY "Public read — blog-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'blog-images');

CREATE POLICY "Public read — testimonial-photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'testimonial-photos');

CREATE POLICY "Public read — branding"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'branding');

CREATE POLICY "Public read — og-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'og-images');

-- Admin write (INSERT, UPDATE, DELETE) on all buckets
CREATE POLICY "Admin write — all buckets"
    ON storage.objects FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin update — all buckets"
    ON storage.objects FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admin delete — all buckets"
    ON storage.objects FOR DELETE
    USING (public.is_admin());

-- Admin read on private buckets (documents, misc)
CREATE POLICY "Admin read — documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents' AND public.is_admin());

CREATE POLICY "Admin read — misc"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'misc' AND public.is_admin());
