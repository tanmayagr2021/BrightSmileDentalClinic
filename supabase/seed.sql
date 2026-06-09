-- ============================================================
-- Seed Data
-- Run after all migrations. Creates all required initial rows.
-- DO NOT include any passwords, keys, or secrets here.
-- ============================================================

-- ── Roles ────────────────────────────────────────────────
INSERT INTO public.roles (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'super_admin', 'Full system access including admin user management and system settings'),
    ('00000000-0000-0000-0000-000000000002', 'admin',       'Clinic admin access: appointments, content, doctors, services')
ON CONFLICT (name) DO NOTHING;

-- ── Permissions ───────────────────────────────────────────
INSERT INTO public.permissions (resource, action, description) VALUES
    -- Appointments
    ('appointments', 'read',   'View all appointments'),
    ('appointments', 'create', 'Create appointments on behalf of patients'),
    ('appointments', 'update', 'Update appointment status and details'),
    ('appointments', 'delete', 'Cancel/delete appointments'),
    -- Medical histories
    ('medical_histories', 'read',    'View medical history summaries'),
    ('medical_histories', 'decrypt', 'Decrypt sensitive medical vault fields'),
    -- Doctors
    ('doctors', 'read',   'View all doctors including inactive'),
    ('doctors', 'create', 'Create new doctor profiles'),
    ('doctors', 'update', 'Update doctor profiles'),
    ('doctors', 'delete', 'Soft-delete doctors'),
    -- Services
    ('services', 'read',   'View all services including inactive'),
    ('services', 'create', 'Create new services'),
    ('services', 'update', 'Update services'),
    ('services', 'delete', 'Soft-delete services'),
    -- Content
    ('content', 'read',    'View all content including drafts'),
    ('content', 'create',  'Create blog posts, FAQs, testimonials'),
    ('content', 'update',  'Update published content'),
    ('content', 'publish', 'Publish/unpublish content'),
    ('content', 'delete',  'Soft-delete content'),
    -- Gallery
    ('gallery', 'read',   'View all gallery items'),
    ('gallery', 'create', 'Upload gallery images'),
    ('gallery', 'update', 'Update gallery metadata'),
    ('gallery', 'delete', 'Soft-delete gallery items'),
    -- Settings
    ('settings', 'read',   'View clinic settings'),
    ('settings', 'update', 'Update clinic settings, SEO, branding'),
    -- Admin users (super_admin only)
    ('admin_users', 'read',   'View admin user list'),
    ('admin_users', 'create', 'Invite new admin users'),
    ('admin_users', 'update', 'Update admin user roles and status'),
    ('admin_users', 'delete', 'Deactivate admin users'),
    -- Analytics
    ('analytics', 'read', 'View analytics and reports'),
    -- Contact
    ('contact', 'read',   'View contact form submissions'),
    ('contact', 'update', 'Mark contact submissions as read')
ON CONFLICT (resource, action) DO NOTHING;

-- ── Role permissions: super_admin gets everything ─────────
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    '00000000-0000-0000-0000-000000000001',
    id
FROM public.permissions
ON CONFLICT DO NOTHING;

-- ── Role permissions: admin gets all except admin_users mgmt ─
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    '00000000-0000-0000-0000-000000000002',
    id
FROM public.permissions
WHERE NOT (resource = 'admin_users' AND action IN ('create', 'update', 'delete'))
  AND NOT (resource = 'medical_histories' AND action = 'decrypt')
ON CONFLICT DO NOTHING;

-- ── Site settings (single row) ────────────────────────────
INSERT INTO public.site_settings (
    clinic_name,
    tagline,
    phone_primary,
    phone_whatsapp,
    email_general,
    email_appointments,
    address_line1,
    address_line2,
    address_city,
    address_country,
    booking_form_enabled,
    review_solicitation_enabled,
    cookie_consent_enabled,
    stat_patients,
    stat_years,
    stat_treatments,
    stat_team_label,
    enabled_locales
) VALUES (
    'Bright Smile Dental Clinic Pvt. Ltd.',
    'Creating Smiles, Changing Lives',
    '+977-1-XXXXXXX',
    '+977-98XXXXXXXX',
    'info@brightsmiledentalclinic.com.np',
    'appointments@brightsmiledentalclinic.com.np',
    'Nagpokhari, Naxal',
    NULL,
    'Kathmandu',
    'Nepal',
    true,
    false,
    true,
    1000,
    10,
    20,
    'Experienced Team',
    ARRAY['en']
) ON CONFLICT DO NOTHING;

-- ── Branding (linked to site_settings) ───────────────────
INSERT INTO public.branding (site_id, color_primary, color_primary_dark, color_dark, color_tint, color_text)
SELECT
    id,
    '#4A9B6F',
    '#3d8560',
    '#1A3D2B',
    '#F0F7F2',
    '#1C1C1E'
FROM public.site_settings
LIMIT 1
ON CONFLICT DO NOTHING;

-- ── Opening hours ─────────────────────────────────────────
-- 0=Sunday, 1=Monday, ..., 6=Saturday
-- Typical Nepali dental clinic hours: Sun-Fri 9am-6pm, Sat 9am-1pm, closed on public holidays
INSERT INTO public.opening_hours (day_of_week, is_open, open_time, close_time) VALUES
    (0, true,  '09:00', '18:00'),  -- Sunday (working day in Nepal)
    (1, true,  '09:00', '18:00'),  -- Monday
    (2, true,  '09:00', '18:00'),  -- Tuesday
    (3, true,  '09:00', '18:00'),  -- Wednesday
    (4, true,  '09:00', '18:00'),  -- Thursday
    (5, true,  '09:00', '18:00'),  -- Friday
    (6, true,  '09:00', '13:00')   -- Saturday (half day)
ON CONFLICT (day_of_week) DO NOTHING;

-- ── Homepage sections ─────────────────────────────────────
INSERT INTO public.homepage_sections (section_key, is_visible, sort_order) VALUES
    ('hero',             true,  1),
    ('services',         true,  2),
    ('doctors',          true,  3),
    ('stats',            true,  4),
    ('testimonials',     true,  5),
    ('faq',              true,  6),
    ('gallery_preview',  true,  7),
    ('cta',              true,  8),
    ('blog',             false, 9)   -- Hidden at launch; enable when first post is published
ON CONFLICT (section_key) DO NOTHING;

-- ── SEO settings (pre-seeded page slugs) ─────────────────
INSERT INTO public.seo_settings (slug, meta_title, meta_description) VALUES
    ('home',         'Bright Smile Dental Clinic | Nagpokhari, Kathmandu',           'Trusted dental care in Nagpokhari, Naxal, Kathmandu. Experienced dentists, modern equipment, and affordable treatment.'),
    ('about',        'About Us | Bright Smile Dental Clinic',                         'Learn about Bright Smile Dental Clinic — our team, our mission, and our commitment to your smile.'),
    ('services',     'Dental Services | Bright Smile Dental Clinic Kathmandu',        'Explore our dental services: general dentistry, cosmetic dentistry, orthodontics, and more in Kathmandu.'),
    ('doctors',      'Our Dentists | Bright Smile Dental Clinic',                     'Meet our experienced dental team at Bright Smile Dental Clinic, Nagpokhari, Kathmandu.'),
    ('contact',      'Contact Us | Bright Smile Dental Clinic Kathmandu',             'Contact Bright Smile Dental Clinic in Nagpokhari, Naxal, Kathmandu. Book an appointment online or call us.'),
    ('faq',          'Frequently Asked Questions | Bright Smile Dental Clinic',       'Answers to common questions about dental treatments, appointments, and more at Bright Smile Dental Clinic.'),
    ('gallery',      'Clinic Gallery | Bright Smile Dental Clinic',                   'See our clinic facilities and patient smile transformations at Bright Smile Dental Clinic, Kathmandu.'),
    ('blog',         'Dental Health Blog | Bright Smile Dental Clinic',               'Expert dental health tips and news from the team at Bright Smile Dental Clinic.'),
    ('privacy',      'Privacy Policy | Bright Smile Dental Clinic',                   'Privacy policy for Bright Smile Dental Clinic website — how we collect, use, and protect your data.'),
    ('book',         'Book an Appointment | Bright Smile Dental Clinic Kathmandu',    'Book a dental appointment at Bright Smile Dental Clinic, Nagpokhari, Naxal, Kathmandu. Easy online booking.')
ON CONFLICT (slug) DO NOTHING;

-- ── Service categories ────────────────────────────────────
INSERT INTO public.service_categories (name, slug, sort_order) VALUES
    ('General Dentistry',    'general-dentistry',    1),
    ('Cosmetic Dentistry',   'cosmetic-dentistry',   2),
    ('Orthodontics',         'orthodontics',         3),
    ('Oral Surgery',         'oral-surgery',         4),
    ('Preventive Care',      'preventive-care',      5),
    ('Pediatric Dentistry',  'pediatric-dentistry',  6)
ON CONFLICT (slug) DO NOTHING;
