-- ============================================================
-- Migration 013: Performance Indexes
-- ============================================================

-- ── Admin tables ──────────────────────────────────────────
CREATE INDEX idx_admin_users_role_id    ON public.admin_users(role_id);
CREATE INDEX idx_admin_users_is_active  ON public.admin_users(is_active) WHERE is_active = true;
CREATE INDEX idx_admin_users_deleted_at ON public.admin_users(deleted_at) WHERE deleted_at IS NULL;

-- ── Doctors ───────────────────────────────────────────────
CREATE INDEX idx_doctors_slug       ON public.doctors(slug);
CREATE INDEX idx_doctors_is_active  ON public.doctors(is_active, deleted_at) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_doctors_sort_order ON public.doctors(sort_order);

-- ── Doctor availability ───────────────────────────────────
CREATE INDEX idx_doctor_availability_doctor_id ON public.doctor_availability(doctor_id);

-- ── Blocked dates ─────────────────────────────────────────
CREATE INDEX idx_blocked_dates_doctor_date ON public.blocked_dates(doctor_id, blocked_date);

-- ── Services ──────────────────────────────────────────────
CREATE INDEX idx_services_slug        ON public.services(slug);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_services_is_active   ON public.services(is_active, deleted_at) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_services_is_featured ON public.services(is_featured) WHERE is_featured = true;

-- ── Doctor services ───────────────────────────────────────
CREATE INDEX idx_doctor_services_doctor_id  ON public.doctor_services(doctor_id);
CREATE INDEX idx_doctor_services_service_id ON public.doctor_services(service_id);

-- ── Appointments ──────────────────────────────────────────
CREATE INDEX idx_appointments_doctor_date   ON public.appointments(doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient_email ON public.appointments(patient_email);
CREATE INDEX idx_appointments_status        ON public.appointments(status);
CREATE INDEX idx_appointments_date          ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_reminder      ON public.appointments(reminder_sent, appointment_date)
    WHERE reminder_sent = false AND status IN ('pending', 'confirmed');

-- Prevent double-booking: same doctor, date, time, active statuses only.
CREATE UNIQUE INDEX idx_appointments_no_double_booking
    ON public.appointments(doctor_id, appointment_date, appointment_time)
    WHERE status NOT IN ('cancelled', 'no_show');

-- ── Appointment tokens ────────────────────────────────────
CREATE INDEX idx_appointment_tokens_token          ON public.appointment_tokens(token);
CREATE INDEX idx_appointment_tokens_appointment_id ON public.appointment_tokens(appointment_id);

-- ── Appointment status history ────────────────────────────
CREATE INDEX idx_status_history_appointment_id ON public.appointment_status_history(appointment_id);

-- ── Media library ─────────────────────────────────────────
CREATE INDEX idx_media_library_bucket      ON public.media_library(bucket);
CREATE INDEX idx_media_library_is_deleted  ON public.media_library(is_deleted) WHERE is_deleted = false;

-- ── Gallery ───────────────────────────────────────────────
CREATE INDEX idx_gallery_group_id   ON public.gallery(group_id);
CREATE INDEX idx_gallery_is_visible ON public.gallery(is_visible, deleted_at) WHERE is_visible = true AND deleted_at IS NULL;

-- ── Testimonials ──────────────────────────────────────────
CREATE INDEX idx_testimonials_status ON public.testimonials(status) WHERE status = 'approved';

-- ── Contact submissions ───────────────────────────────────
CREATE INDEX idx_contact_submissions_is_read ON public.contact_submissions(is_read) WHERE is_read = false;

-- ── Blog posts ────────────────────────────────────────────
CREATE INDEX idx_blog_posts_slug         ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status       ON public.blog_posts(status) WHERE status = 'published';
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_posts_author_id    ON public.blog_posts(author_id);

-- ── Blog posts categories ─────────────────────────────────
CREATE INDEX idx_blog_posts_categories_post     ON public.blog_posts_categories(post_id);
CREATE INDEX idx_blog_posts_categories_category ON public.blog_posts_categories(category_id);

-- ── Newsletter subscribers ────────────────────────────────
CREATE INDEX idx_newsletter_subscribers_email     ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_is_active ON public.newsletter_subscribers(is_active) WHERE is_active = true;

-- ── Audit log ─────────────────────────────────────────────
CREATE INDEX idx_audit_log_actor_id    ON public.audit_log(actor_id);
CREATE INDEX idx_audit_log_resource    ON public.audit_log(resource, resource_id);
CREATE INDEX idx_audit_log_created_at  ON public.audit_log(created_at DESC);

-- ── Medical history access log ────────────────────────────
CREATE INDEX idx_medical_access_log_history_id ON public.medical_history_access_log(medical_history_id);
CREATE INDEX idx_medical_access_log_accessed_by ON public.medical_history_access_log(accessed_by);
CREATE INDEX idx_medical_access_log_accessed_at ON public.medical_history_access_log(accessed_at DESC);

-- ── Content versions ──────────────────────────────────────
CREATE INDEX idx_content_versions_entity ON public.content_versions(entity_type, entity_id);

-- ── Content translations ──────────────────────────────────
CREATE INDEX idx_content_translations_entity ON public.content_translations(entity_type, entity_id, language_code);

-- ── SEO settings ─────────────────────────────────────────
CREATE INDEX idx_seo_settings_slug ON public.seo_settings(slug);
