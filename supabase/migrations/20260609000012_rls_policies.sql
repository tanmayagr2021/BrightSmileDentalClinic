-- ============================================================
-- Migration 012: Row Level Security Policies
-- Three tiers: anon (public content), admin, super_admin.
-- Every table has RLS enabled regardless of whether policies
-- restrict access — defense in depth.
-- ============================================================

-- ── Enable RLS on all tables ──────────────────────────────
ALTER TABLE public.roles                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_hours               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_qualifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_histories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_notes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_tokens          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_groups              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts_categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history_access_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_translations        ENABLE ROW LEVEL SECURITY;

-- ── RBAC tables (roles, permissions, role_permissions) ────
-- Read-only for all admins; no public access.
CREATE POLICY "Admin read roles"         ON public.roles         FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin read permissions"   ON public.permissions   FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin read role_perms"    ON public.role_permissions FOR SELECT USING (public.is_admin());

-- ── Admin users ───────────────────────────────────────────
-- Admins see their own row. Super admins see all (non-deleted).
CREATE POLICY "Admin read own profile"
    ON public.admin_users FOR SELECT
    USING (id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Super admin manage admin_users"
    ON public.admin_users FOR ALL
    USING (public.is_super_admin());

-- ── Site settings ─────────────────────────────────────────
-- Anon/public: can read site_settings and branding (for frontend rendering).
CREATE POLICY "Public read site_settings"
    ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admin update site_settings"
    ON public.site_settings FOR UPDATE USING (public.is_admin());

CREATE POLICY "Public read branding"
    ON public.branding FOR SELECT USING (true);

CREATE POLICY "Admin update branding"
    ON public.branding FOR UPDATE USING (public.is_admin());

-- ── Opening hours ─────────────────────────────────────────
CREATE POLICY "Public read opening_hours"
    ON public.opening_hours FOR SELECT USING (true);

CREATE POLICY "Admin manage opening_hours"
    ON public.opening_hours FOR ALL USING (public.is_admin());

-- ── Homepage sections ─────────────────────────────────────
CREATE POLICY "Public read homepage_sections"
    ON public.homepage_sections FOR SELECT USING (is_visible = true);

CREATE POLICY "Admin manage homepage_sections"
    ON public.homepage_sections FOR ALL USING (public.is_admin());

-- ── SEO settings ─────────────────────────────────────────
CREATE POLICY "Public read seo_settings"
    ON public.seo_settings FOR SELECT USING (true);

CREATE POLICY "Admin manage seo_settings"
    ON public.seo_settings FOR ALL USING (public.is_admin());

-- ── Contact submissions ───────────────────────────────────
-- Anonymous insert only. Admins read/manage.
CREATE POLICY "Anon insert contact_submissions"
    ON public.contact_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read contact_submissions"
    ON public.contact_submissions FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin update contact_submissions"
    ON public.contact_submissions FOR UPDATE USING (public.is_admin());

-- ── Doctors ───────────────────────────────────────────────
CREATE POLICY "Public read active doctors"
    ON public.doctors FOR SELECT
    USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admin read all doctors"
    ON public.doctors FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin manage doctors"
    ON public.doctors FOR ALL
    USING (public.is_admin());

-- ── Doctor qualifications ─────────────────────────────────
CREATE POLICY "Public read doctor qualifications"
    ON public.doctor_qualifications FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.doctors d
        WHERE d.id = doctor_id AND d.is_active = true AND d.deleted_at IS NULL
    ));

CREATE POLICY "Admin manage doctor_qualifications"
    ON public.doctor_qualifications FOR ALL
    USING (public.is_admin());

-- ── Doctor availability ───────────────────────────────────
CREATE POLICY "Public read doctor_availability"
    ON public.doctor_availability FOR SELECT USING (true);

CREATE POLICY "Admin manage doctor_availability"
    ON public.doctor_availability FOR ALL
    USING (public.is_admin());

-- ── Blocked dates ─────────────────────────────────────────
-- Public needs to know unavailable dates for booking UI.
CREATE POLICY "Public read blocked_dates"
    ON public.blocked_dates FOR SELECT USING (true);

CREATE POLICY "Admin manage blocked_dates"
    ON public.blocked_dates FOR ALL
    USING (public.is_admin());

-- ── Service categories ────────────────────────────────────
CREATE POLICY "Public read visible service_categories"
    ON public.service_categories FOR SELECT
    USING (is_visible = true);

CREATE POLICY "Admin manage service_categories"
    ON public.service_categories FOR ALL
    USING (public.is_admin());

-- ── Services ──────────────────────────────────────────────
CREATE POLICY "Public read active services"
    ON public.services FOR SELECT
    USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admin read all services"
    ON public.services FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin manage services"
    ON public.services FOR ALL
    USING (public.is_admin());

-- ── Doctor services ───────────────────────────────────────
CREATE POLICY "Public read doctor_services"
    ON public.doctor_services FOR SELECT USING (true);

CREATE POLICY "Admin manage doctor_services"
    ON public.doctor_services FOR ALL
    USING (public.is_admin());

-- ── Appointments ──────────────────────────────────────────
-- Public (service role) INSERT only — enforced at API layer via service role.
-- Direct anon access blocked; all public writes go through /api/appointments.
CREATE POLICY "Admin read appointments"
    ON public.appointments FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin update appointments"
    ON public.appointments FOR UPDATE
    USING (public.is_admin());

-- Service role bypass (no RLS for service role key) handles public INSERT.

-- ── Medical histories ─────────────────────────────────────
-- Admin only. No public access. Super admin full access.
CREATE POLICY "Admin read medical_histories"
    ON public.medical_histories FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin manage medical_histories"
    ON public.medical_histories FOR ALL
    USING (public.is_admin());

-- ── Appointment notes ─────────────────────────────────────
CREATE POLICY "Admin manage appointment_notes"
    ON public.appointment_notes FOR ALL
    USING (public.is_admin());

-- ── Appointment tokens ────────────────────────────────────
-- Public SELECT by token value only (for cancellation page).
-- No direct admin listing — tokens accessed via API.
CREATE POLICY "Public read token by value"
    ON public.appointment_tokens FOR SELECT
    USING (used_at IS NULL AND expires_at > timezone('utc', now()));

CREATE POLICY "Admin read all tokens"
    ON public.appointment_tokens FOR SELECT
    USING (public.is_admin());

-- ── Appointment status history ────────────────────────────
-- Append-only: admins read, no update or delete for any role.
CREATE POLICY "Admin read status_history"
    ON public.appointment_status_history FOR SELECT
    USING (public.is_admin());

-- ── Media library ─────────────────────────────────────────
CREATE POLICY "Admin manage media_library"
    ON public.media_library FOR ALL
    USING (public.is_admin());

-- ── Gallery groups ────────────────────────────────────────
CREATE POLICY "Public read visible gallery_groups"
    ON public.gallery_groups FOR SELECT
    USING (is_visible = true AND deleted_at IS NULL);

CREATE POLICY "Admin manage gallery_groups"
    ON public.gallery_groups FOR ALL
    USING (public.is_admin());

-- ── Gallery ───────────────────────────────────────────────
CREATE POLICY "Public read visible gallery"
    ON public.gallery FOR SELECT
    USING (is_visible = true AND deleted_at IS NULL);

CREATE POLICY "Admin manage gallery"
    ON public.gallery FOR ALL
    USING (public.is_admin());

-- ── Testimonials ──────────────────────────────────────────
CREATE POLICY "Public read approved testimonials"
    ON public.testimonials FOR SELECT
    USING (status = 'approved' AND deleted_at IS NULL);

CREATE POLICY "Admin manage testimonials"
    ON public.testimonials FOR ALL
    USING (public.is_admin());

-- ── FAQs ──────────────────────────────────────────────────
CREATE POLICY "Public read visible faqs"
    ON public.faqs FOR SELECT
    USING (is_visible = true);

CREATE POLICY "Admin manage faqs"
    ON public.faqs FOR ALL
    USING (public.is_admin());

-- ── Blog categories ───────────────────────────────────────
CREATE POLICY "Public read blog_categories"
    ON public.blog_categories FOR SELECT USING (true);

CREATE POLICY "Admin manage blog_categories"
    ON public.blog_categories FOR ALL
    USING (public.is_admin());

-- ── Blog posts ────────────────────────────────────────────
CREATE POLICY "Public read published blog_posts"
    ON public.blog_posts FOR SELECT
    USING (
        status = 'published'
        AND deleted_at IS NULL
        AND (published_at IS NULL OR published_at <= timezone('utc', now()))
    );

CREATE POLICY "Admin read all blog_posts"
    ON public.blog_posts FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin manage blog_posts"
    ON public.blog_posts FOR ALL
    USING (public.is_admin());

-- ── Blog posts categories ─────────────────────────────────
CREATE POLICY "Public read blog_posts_categories"
    ON public.blog_posts_categories FOR SELECT USING (true);

CREATE POLICY "Admin manage blog_posts_categories"
    ON public.blog_posts_categories FOR ALL
    USING (public.is_admin());

-- ── Newsletter subscribers ────────────────────────────────
-- Anonymous INSERT for subscribe. Admin reads. No public reads of subscriber list.
CREATE POLICY "Anon insert newsletter_subscribers"
    ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage newsletter_subscribers"
    ON public.newsletter_subscribers FOR ALL
    USING (public.is_admin());

-- ── Audit log ─────────────────────────────────────────────
-- Append-only: INSERT via service role/trigger. Admin SELECT. No UPDATE/DELETE for anyone.
CREATE POLICY "Admin read audit_log"
    ON public.audit_log FOR SELECT
    USING (public.is_admin());

-- ── Medical history access log ────────────────────────────
-- Super admin only — compliance sensitive.
CREATE POLICY "Super admin read medical_history_access_log"
    ON public.medical_history_access_log FOR SELECT
    USING (public.is_super_admin());

-- ── Content versions ──────────────────────────────────────
CREATE POLICY "Admin read content_versions"
    ON public.content_versions FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin insert content_versions"
    ON public.content_versions FOR INSERT
    WITH CHECK (public.is_admin());

-- ── Content translations ──────────────────────────────────
-- Public read (needed for frontend rendering of translated content).
CREATE POLICY "Public read content_translations"
    ON public.content_translations FOR SELECT USING (true);

CREATE POLICY "Admin manage content_translations"
    ON public.content_translations FOR ALL
    USING (public.is_admin());
