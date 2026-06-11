-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add showcase_slides table, seed site/SEO settings, gallery groups
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Add short_description to service_categories ───────────────────────────
ALTER TABLE public.service_categories
  ADD COLUMN IF NOT EXISTS short_description text;

-- ── 2. Create showcase_slides table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.showcase_slides (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    title           text        NOT NULL,
    subtitle        text,
    description     text,
    category        text        NOT NULL DEFAULT 'clinic',
    image_url       text,
    gradient_from   text        NOT NULL DEFAULT '#1e4030',
    gradient_to     text        NOT NULL DEFAULT '#122618',
    accent_color    text        NOT NULL DEFAULT '#4A9B6F',
    sort_order      integer     NOT NULL DEFAULT 0,
    is_visible      boolean     NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_showcase_slides
    BEFORE UPDATE ON public.showcase_slides
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 3. Seed showcase_slides with static defaults ──────────────────────────────
INSERT INTO public.showcase_slides (title, subtitle, description, category, gradient_from, gradient_to, accent_color, sort_order, is_visible)
VALUES
  ('Reception & Welcome Area',  'First Impressions',   'A warm, welcoming space designed to put patients at ease from the moment they arrive.',                                          'reception',    '#1e4030', '#122618', '#4A9B6F', 1, true),
  ('Patient Waiting Lounge',    'Comfort & Calm',      'A comfortable, private lounge designed to make your wait as relaxed as possible.',                                               'waiting',      '#151e2a', '#0c1018', '#5b8fb9', 2, true),
  ('Treatment Rooms',           'Clinical Precision',  'Fully equipped, sterile treatment rooms designed for comfort and clinical excellence.',                                            'treatment',    '#1e321e', '#122012', '#4A9B6F', 3, true),
  ('Advanced Equipment',        'Modern Technology',   'State-of-the-art digital X-rays and precision instruments for accurate, safe treatment.',                                          'equipment',    '#16161f', '#0c0c14', '#9b7fa6', 4, true),
  ('Consultation Suites',       'Expert Guidance',     'Private, calm consultation rooms where your dentist walks you through every step of your treatment plan.',                         'consultation', '#1a1e14', '#0f120c', '#8fb96b', 5, true)
ON CONFLICT DO NOTHING;

-- ── 4. Seed gallery_groups ────────────────────────────────────────────────────
INSERT INTO public.gallery_groups (name, slug, description, sort_order, is_visible)
VALUES
  ('Our Clinic',  'clinic',    'Photos of our clinic interior, reception and treatment rooms.', 1, true),
  ('Our Team',    'team',      'Photos of our doctors and staff.',                              2, true),
  ('Equipment',   'equipment', 'Our modern dental equipment and technology.',                   3, true)
ON CONFLICT (slug) DO NOTHING;

-- ── 5. Seed site_settings (single row) ───────────────────────────────────────
INSERT INTO public.site_settings (
    clinic_name, tagline,
    phone_primary, phone_whatsapp,
    email_general, email_appointments,
    address_line1, address_line2, address_city, address_country,
    google_maps_url,
    facebook_url, instagram_url,
    booking_form_enabled
)
VALUES (
    'Bright Smile Dental Clinic',
    'Creating Smiles, Changing Lives',
    '+977-1-4432690',
    '+977-9841234567',
    'info@brightsmile.com.np',
    'appointments@brightsmile.com.np',
    'Nagpokhari, Naxal',
    '',
    'Kathmandu',
    'Nepal',
    'https://maps.app.goo.gl/brightsmile',
    'https://www.facebook.com/brightsmilenepal',
    'https://www.instagram.com/brightsmilenepal',
    true
)
ON CONFLICT DO NOTHING;

-- ── 6. Seed opening_hours (0=Sunday … 6=Saturday) ────────────────────────────
INSERT INTO public.opening_hours (day_of_week, is_open, open_time, close_time)
VALUES
  (0, false, null,   null),
  (1, true,  '09:00','18:00'),
  (2, true,  '09:00','18:00'),
  (3, true,  '09:00','18:00'),
  (4, true,  '09:00','18:00'),
  (5, true,  '09:00','18:00'),
  (6, true,  '09:00','14:00')
ON CONFLICT (day_of_week) DO NOTHING;

-- ── 7. Seed seo_settings per page ────────────────────────────────────────────
INSERT INTO public.seo_settings (slug, meta_title, meta_description, is_noindex)
VALUES
  ('home',         'Bright Smile Dental Clinic | Dentist in Kathmandu, Nepal',           'NMC-registered dental clinic in Nagpokhari, Naxal, Kathmandu. 6 experienced dentists offering implants, orthodontics, root canal, cosmetic dentistry and more.',  false),
  ('services',     'Our Services — Bright Smile Dental Clinic',                          'Comprehensive dental services including general dentistry, orthodontics, cosmetic treatments, dental implants, oral surgery, and paediatric care in Kathmandu.',      false),
  ('doctors',      'Our Doctors & Care Team — Bright Smile',                              'Meet our NMC-registered lead dentists and specialist team at Bright Smile Dental Clinic, Kathmandu.',                                                               false),
  ('appointments', 'Book an Appointment — Bright Smile Dental Clinic',                   'Book a dental appointment at Bright Smile Dental Clinic, Nagpokhari, Naxal, Kathmandu. Choose your dentist and confirm in minutes.',                                false),
  ('contact',      'Contact Us — Bright Smile Dental Clinic',                            'Get in touch with Bright Smile Dental Clinic. Call, WhatsApp, or visit us at Nagpokhari, Naxal, Kathmandu.',                                                        false),
  ('faq',          'Frequently Asked Questions — Bright Smile',                           'Answers to common questions about our dental services, appointments, costs and treatments.',                                                                         false),
  ('gallery',      'Gallery — Bright Smile Dental Clinic',                               'View photos of our modern dental clinic, treatment rooms, equipment and team.',                                                                                      false),
  ('about',        'About Us — Bright Smile Dental Clinic',                              'Learn about Bright Smile Dental Clinic — our mission, values and care philosophy.',                                                                                   false)
ON CONFLICT (slug) DO NOTHING;

-- ── 8. Seed short_description for service_categories ──────────────────────────
UPDATE public.service_categories SET short_description = 'Routine checkups, fillings, extractions, root canals and all preventive care for lifelong healthy teeth.'     WHERE slug = 'general-dentistry'  AND short_description IS NULL;
UPDATE public.service_categories SET short_description = 'Teeth whitening, veneers, bonding and smile makeovers that transform how you look and feel.'                  WHERE slug = 'cosmetic-dentistry' AND short_description IS NULL;
UPDATE public.service_categories SET short_description = 'Braces and aligners to straighten teeth, correct bite issues and create confident, lasting smiles.'           WHERE slug = 'orthodontics'       AND short_description IS NULL;
UPDATE public.service_categories SET short_description = 'Extractions, wisdom tooth removal and minor surgical procedures delivered with precision and minimal discomfort.' WHERE slug = 'oral-surgery'      AND short_description IS NULL;
UPDATE public.service_categories SET short_description = 'Permanent tooth replacement using titanium implants — the gold standard for missing teeth.'                   WHERE slug = 'dental-implants'    AND short_description IS NULL;
UPDATE public.service_categories SET short_description = 'Gentle, specialist dental care designed specifically for children from their first visit onwards.'             WHERE slug = 'pediatric-dentistry' AND short_description IS NULL;
