-- ============================================================
-- Copy polish for content_blocks.
--
-- A previous pass stripped em dashes from the live copy without
-- restructuring the sentences. That left a run of comma splices,
-- one block with no punctuation at all where the dash used to be
-- ('contact.hero.description'), and a stray space before a comma
-- ('contact.emergency.text'). Each block below is restored to the
-- clean sentence its React fallback in src/ still carries, so the
-- DB copy and the code fallback match again. No facts, numbers,
-- names or links change.
--
-- Idempotent: every statement is a keyed UPDATE, safe to re-run.
-- ============================================================

-- "...answer your questions no commitment, no pressure." — punctuation gone entirely
UPDATE public.content_blocks
SET value = 'We''re here to answer your questions — no commitment, no pressure. Reach us by phone, WhatsApp, email, or the form.'
WHERE key = 'contact.hero.description';

-- "Call us immediately , we do our best..." — space before comma + comma splice
UPDATE public.content_blocks
SET value = 'Call us immediately — we do our best to see emergency patients the same day.'
WHERE key = 'contact.emergency.text';

-- "...covering all areas of dentistry, one commitment: exceptional care every visit." — comma splice
UPDATE public.content_blocks
SET value = 'Serving Kathmandu for 20 years, with more than 5,000 patients and an experienced team covering every area of dentistry. One commitment: exceptional care, every visit.'
WHERE key = 'home.trust.intro';

-- "We are located in a well-known area, locals can direct you." — comma splice
UPDATE public.content_blocks
SET value = 'A 10-minute walk from Naxal Bhagwati temple. We are located in a well-known area — locals can direct you.'
WHERE key = 'contact.directions.foot_desc';

-- "Book your consultation today, our team is here to help..." — comma splice
UPDATE public.content_blocks
SET value = 'Take the first step towards a healthier, more confident smile. Book your consultation today — our team is here to help every step of the way.'
WHERE key = 'home.cta.intro';

-- "...as patients provide consent, check back soon." — comma splice; also restores the dropped opening line
UPDATE public.content_blocks
SET value = 'Real transformations from our patients. Photos will be added as patients provide consent — check back soon.'
WHERE key = 'home.before_after.intro';

-- "...before you book, no commitment needed." — comma splice
UPDATE public.content_blocks
SET value = 'Our team answers questions before you book — no commitment needed.'
WHERE key = 'home.journey.bottom_subtext';

-- "Comprehensive dental care under one roof, modern treatments..." — comma splice / fragment
UPDATE public.content_blocks
SET value = 'Comprehensive dental care under one roof — modern treatments delivered with expertise and a genuinely gentle touch.'
WHERE key = 'home.services.intro';

-- "...our two lead dentists, with over 50 years of combined experience." — doubled "with"
UPDATE public.content_blocks
SET value = 'Appointments are available directly with our two lead dentists — both NMC-registered with over 50 years of combined experience.'
WHERE key = 'home.doctors.intro';

-- "Implants, periodontics, oral surgery: our {count} visiting specialists..." — colon after a 3-item list
UPDATE public.content_blocks
SET value = 'Implants, periodontics, oral surgery — our {count} visiting specialists join your care, coordinated entirely by us.'
WHERE key = 'home.doctors.pathway_step3_desc';

-- "...covering all specialities in dentistry, with transparent..." — "in dentistry" is redundant
UPDATE public.content_blocks
SET value = 'Modern dentistry with genuine care, covering every speciality, with transparent treatment planning and results built to last.'
WHERE key = 'home.hero.subcopy';
