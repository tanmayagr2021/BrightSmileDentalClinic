-- ============================================================
-- Migration: Extend doctors table for CMS admin management
-- Adds fields needed for the admin doctor CMS pages.
-- ============================================================

ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS qualification   text,
ADD COLUMN IF NOT EXISTS short_name      text,
ADD COLUMN IF NOT EXISTS doctor_type     text NOT NULL DEFAULT 'lead'
    CHECK (doctor_type IN ('lead', 'specialist')),
ADD COLUMN IF NOT EXISTS is_bookable     boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS specializations text[]  NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages       text[]  NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_text text,
ADD COLUMN IF NOT EXISTS education       text,
ADD COLUMN IF NOT EXISTS color_hex       text,
ADD COLUMN IF NOT EXISTS initials        text;

-- ── Seed the 6 doctors ────────────────────────────────────
INSERT INTO public.doctors (
    full_name, slug, title, nmc_number,
    qualification, short_name, doctor_type, is_bookable,
    specializations, languages, experience_text, education,
    color_hex, initials,
    short_bio, full_bio,
    is_active, sort_order
) VALUES
(
    'Dr. Sachin Agrawal', 'dr-sachin-agrawal',
    'Lead Dentist & Dental Surgeon', 'NMC 3216',
    'BDS', 'Dr. Sachin', 'lead', true,
    ARRAY['General Dentistry', 'Oral Surgery', 'Smile Design', 'Root Canal Treatment'],
    ARRAY['Nepali', 'Hindi', 'English'],
    '10+ years', 'BDS — B.P. Koirala Institute of Health Sciences',
    '#1A3D2B', 'SA',
    'Founder and lead dentist with a decade of experience in general and surgical dentistry.',
    'Dr. Sachin Agrawal is the founder and lead dentist at Bright Smile Dental Clinic. With over a decade of experience in general and surgical dentistry, he is known for his clinical precision and compassionate, patient-first approach — ensuring every visit is comfortable and every treatment plan is clearly explained.',
    true, 1
),
(
    'Dr. Binita Adhikari', 'dr-binita-adhikari',
    'General & Dental Surgeon', 'NMC 2687',
    'BDS', 'Dr. Binita', 'lead', true,
    ARRAY['Restorative Dentistry', 'Cosmetic Dentistry', 'Preventive Care', 'Composite Fillings'],
    ARRAY['Nepali', 'Hindi', 'English'],
    '8+ years', 'BDS — Kathmandu University',
    '#3d8560', 'BA',
    'Skilled general and dental surgeon known for restorative expertise and easing dental anxiety.',
    'Dr. Binita Adhikari is a skilled general and dental surgeon with a gentle, patient-focused approach. Known for her expertise in restorative dentistry and her ability to ease dental anxiety, she ensures every patient leaves with complete confidence in their smile and their care.',
    true, 2
),
(
    'Dr. Ameena Pradhan', 'dr-ameena-pradhan',
    'Periodontist', 'NMC 3013',
    'MDS', 'Dr. Ameena', 'specialist', false,
    ARRAY['Periodontics', 'Gum Disease Treatment', 'Scaling & Root Planing', 'Implant Support'],
    ARRAY['Nepali', 'Hindi', 'English'],
    '9+ years', 'MDS Periodontics — Tribhuvan University',
    '#4A9B6F', 'AP',
    'MDS-qualified periodontist specialising in gum health and dental implant support.',
    'Dr. Ameena Pradhan holds a Master''s in Dental Surgery (Periodontics) and specialises in gum health, periodontal disease treatment and dental implant support. Her advanced training allows her to manage complex gum conditions with precision and care.',
    true, 3
),
(
    'Dr. Sabin Giri', 'dr-sabin-giri',
    'Oral & Maxillofacial Surgeon', 'NMC 3914',
    'BDS', 'Dr. Sabin', 'specialist', false,
    ARRAY['Oral Surgery', 'Wisdom Tooth Removal', 'Complex Extractions', 'Minor Oral Surgery'],
    ARRAY['Nepali', 'Hindi', 'English'],
    '6+ years', 'BDS — College of Medical Sciences, Bharatpur',
    '#1A3D2B', 'SG',
    'Oral surgeon specialising in complex extractions, wisdom tooth surgery and minor oral procedures.',
    'Dr. Sabin Giri is our oral and maxillofacial surgeon specialising in complex tooth extractions, wisdom tooth surgery and minor oral surgical procedures. His expertise ensures safe, efficient treatment with minimal discomfort and clear aftercare guidance.',
    true, 4
),
(
    'Dr. Shashi Bhushan Singh', 'dr-shashi-bhushan-singh',
    'Implantologist', 'NMC 3449',
    'BDS', 'Dr. Shashi', 'specialist', false,
    ARRAY['Dental Implants', 'Full Arch Restoration', 'Bone Grafting', 'Implant Prosthetics'],
    ARRAY['Nepali', 'Hindi', 'English'],
    '7+ years', 'BDS — B.P. Koirala Institute of Health Sciences',
    '#3d8560', 'SS',
    'Dental implant specialist with experience in single implants, multiple implants and full-arch rehabilitation.',
    'Dr. Shashi Bhushan Singh is our resident dental implant specialist. He is experienced in single-tooth implants, multiple implants and full-arch rehabilitation — restoring smiles and function with lasting clinical precision.',
    true, 5
),
(
    'Dr. Rinky Nyachhyon', 'dr-rinky-nyachhyon',
    'Oral Medicine & Radiologist', 'NMC 3201',
    'BDS', 'Dr. Rinky', 'specialist', false,
    ARRAY['Oral Medicine', 'Dental Radiology', 'Oral Diagnosis', 'Oral Pathology'],
    ARRAY['Nepali', 'Hindi', 'English'],
    '5+ years', 'BDS — Manipal College of Medical Sciences, Pokhara',
    '#4A9B6F', 'RN',
    'Oral medicine and radiology specialist using advanced digital imaging for accurate diagnosis.',
    'Dr. Rinky Nyachhyon specialises in oral medicine and dental radiology, playing a critical role in accurate diagnosis. She uses advanced digital imaging to detect conditions early, enabling the most effective treatment planning across all specialties.',
    true, 6
)
ON CONFLICT (slug) DO UPDATE SET
    title            = EXCLUDED.title,
    nmc_number       = EXCLUDED.nmc_number,
    qualification    = EXCLUDED.qualification,
    short_name       = EXCLUDED.short_name,
    doctor_type      = EXCLUDED.doctor_type,
    is_bookable      = EXCLUDED.is_bookable,
    specializations  = EXCLUDED.specializations,
    languages        = EXCLUDED.languages,
    experience_text  = EXCLUDED.experience_text,
    education        = EXCLUDED.education,
    color_hex        = EXCLUDED.color_hex,
    initials         = EXCLUDED.initials,
    short_bio        = EXCLUDED.short_bio,
    full_bio         = EXCLUDED.full_bio,
    sort_order       = EXCLUDED.sort_order,
    updated_at       = now();
