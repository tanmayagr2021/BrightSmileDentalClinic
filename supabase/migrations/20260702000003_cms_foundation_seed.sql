-- ============================================================
-- Migration: CMS Foundation — seed data
-- Generated mechanically from src/lib/constants.ts and the
-- hardcoded-copy inventory. Every content_blocks value equals
-- the current live copy verbatim — zero visual change until an
-- admin edits something.
-- ============================================================

-- content_blocks
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('header.cta_label', 'Book Appointment', 'global', 'header', 'Header CTA button (desktop + mobile)');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('footer.brand_name', 'Bright Smile Dental Clinic', 'global', 'footer', 'Footer brand line under the logo');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('footer.cta_label', 'Book an Appointment', 'global', 'footer', 'Footer gold CTA button');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('footer.contact_heading', 'Visit & Contact', 'global', 'footer', 'Footer contact card heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.eyebrow', 'Bright Smile Dental Clinic · Kathmandu', 'home', 'hero', 'Hero eyebrow label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.headline_line1', 'Expert Dental Care,', 'home', 'hero', 'Hero headline — line 1');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.headline_line2', 'Comfortable', 'home', 'hero', 'Hero headline — line 2 (gold)');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.headline_line3', 'Experience.', 'home', 'hero', 'Hero headline — line 3');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.subcopy', 'Modern dentistry with genuine care — six experienced specialists, transparent treatment planning, and results built to last.', 'home', 'hero', 'Hero sub-copy paragraph');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.cta_primary', 'Book Consultation', 'home', 'hero', 'Hero primary CTA (gold button)');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.cta_secondary', 'View Smile Gallery', 'home', 'hero', 'Hero secondary CTA (ghost button)');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.badge_1', 'NMC Registered', 'home', 'hero', 'Hero trust chip 1');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.badge_2', 'Est. 2013', 'home', 'hero', 'Hero trust chip 2');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.badge_3', '6 Specialists', 'home', 'hero', 'Hero trust chip 3');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.hero.badge_4', 'Kathmandu', 'home', 'hero', 'Hero trust chip 4');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.trust.eyebrow', 'Why Patients Trust Us', 'home', 'trust', 'Trust section eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.trust.heading_line1', 'Care you can', 'home', 'trust', 'Trust heading — line 1');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.trust.heading_line2', 'count on.', 'home', 'trust', 'Trust heading — line 2');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.trust.heading_line3', 'Since 2013.', 'home', 'trust', 'Trust heading — line 3 (primary color)');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.trust.intro', 'Serving Kathmandu for over a decade — 1,000+ patients, 6 specialists, one commitment: exceptional care every visit.', 'home', 'trust', 'Trust intro paragraph');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.trust.bottom_line', 'Serving Kathmandu since 2013 — Over 1,000 patients trust us with their smiles.', 'home', 'trust', 'Trust bottom strip line');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.journey.eyebrow', 'The Experience', 'home', 'journey', 'Patient journey eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.journey.heading_line1', 'A Day at', 'home', 'journey', 'Patient journey heading — line 1');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.journey.heading_line2', 'Bright Smile', 'home', 'journey', 'Patient journey heading — line 2 (gold)');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.journey.intro', 'From your first call to your final follow-up — every moment is crafted around your comfort, clarity, and confidence.', 'home', 'journey', 'Patient journey intro paragraph');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.journey.cta_label', 'Start Your Journey', 'home', 'journey', 'Patient journey CTA (gold button)');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.journey.bottom_heading', 'Ready to start your journey?', 'home', 'journey', 'Bottom banner heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.journey.bottom_subtext', 'Our team answers questions before you book — no commitment needed.', 'home', 'journey', 'Bottom banner subtext');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.journey.bottom_call_label', 'Call Us', 'home', 'journey', 'Bottom banner call button');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.journey.bottom_book_label', 'Book Online', 'home', 'journey', 'Bottom banner book button');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.eyebrow', 'Direct Appointments', 'home', 'doctors', 'Doctors section eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.heading', 'Meet Our Lead Dentists', 'home', 'doctors', 'Doctors section heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.intro', 'Appointments are available directly with our two lead dentists — both NMC-registered with over a decade of combined experience.', 'home', 'doctors', 'Doctors section intro paragraph');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.full_team_label', 'Full Care Team', 'home', 'doctors', 'Link to /doctors');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.pathway_heading', 'How Your Care Works', 'home', 'doctors', 'Care pathway card heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.pathway_link_label', 'Meet the full team', 'home', 'doctors', 'Care pathway link to /doctors');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.pathway_step1_title', 'Consult a Lead Dentist', 'home', 'doctors', 'Care pathway step 1 title');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.pathway_step1_desc', 'Your first appointment is always with Dr. Sachin or Dr. Binita — who assess your needs and design your care plan.', 'home', 'doctors', 'Care pathway step 1 description');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.pathway_step2_title', 'Your Plan Is Mapped', 'home', 'doctors', 'Care pathway step 2 title');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.pathway_step2_desc', 'If your treatment is straightforward, it begins right here. If it needs deeper expertise, your dentist identifies that early.', 'home', 'doctors', 'Care pathway step 2 description');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.pathway_step3_title', 'We Call the Right Specialist', 'home', 'doctors', 'Care pathway step 3 title');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.pathway_step3_desc', 'Implants, periodontics, oral surgery — our {count} visiting specialists join your care, coordinated entirely by us.', 'home', 'doctors', 'Care pathway step 3 description. {count} is replaced with the live specialist count.');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.team_heading', 'Complete Care Team', 'home', 'doctors', 'Complete care team card heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.team_hygienists_label', 'Dental Hygienists', 'home', 'doctors', 'Hygienists column label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.team_reception_label', 'Reception & Administration', 'home', 'doctors', 'Reception column label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.doctors.team_meet_everyone_label', 'Meet everyone', 'home', 'doctors', 'Link to /doctors');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.services.eyebrow', 'What We Offer', 'home', 'services', 'Services section eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.services.heading', 'Our Services', 'home', 'services', 'Services section heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.services.intro', 'Comprehensive dental care under one roof — modern treatments delivered with expertise and a genuinely gentle touch.', 'home', 'services', 'Services section intro paragraph');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.services.view_all_label', 'View All Services', 'home', 'services', 'Link to /services');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.services.assurance_1', 'All treatments NMC-registered', 'home', 'services', 'Bottom assurance strip item 1');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.services.assurance_2', 'Modern equipment', 'home', 'services', 'Bottom assurance strip item 2');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.services.assurance_3', 'Transparent pricing', 'home', 'services', 'Bottom assurance strip item 3');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.services.assurance_4', 'Gentle, comfortable care', 'home', 'services', 'Bottom assurance strip item 4');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.eyebrow', 'Results', 'home', 'before_after', 'Before/After section eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.heading', 'Before & After', 'home', 'before_after', 'Before/After section heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.intro', 'Real transformations from our patients. Photos will be added as patients provide consent — check back soon.', 'home', 'before_after', 'Before/After section intro paragraph');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.cta_label', 'Book a Consultation', 'home', 'before_after', 'Before/After section CTA');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.bottom_note', 'Patient photos are uploaded by our clinical team with full written consent. All cases are genuine.', 'home', 'before_after', 'Before/After bottom disclaimer');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.awaiting_consent_label', 'Photos — Awaiting Patient Consent', 'home', 'before_after', 'Placeholder overlay shown until case photos are uploaded');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.category_all', 'All Cases', 'home', 'before_after', 'Filter tab — all');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.category_smile_makeover', 'Smile Makeover', 'home', 'before_after', 'Filter tab / category label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.category_orthodontics', 'Orthodontics', 'home', 'before_after', 'Filter tab / category label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.category_whitening', 'Whitening', 'home', 'before_after', 'Filter tab / category label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.before_after.category_implants', 'Implants', 'home', 'before_after', 'Filter tab / category label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.why_choose.eyebrow', 'The Difference', 'home', 'why_choose', 'Why Choose section eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.why_choose.heading_line1', 'The Bright Smile', 'home', 'why_choose', 'Why Choose heading — line 1');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.why_choose.heading_line2', 'Difference', 'home', 'why_choose', 'Why Choose heading — line 2');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.why_choose.intro', 'Six reasons why patients across Kathmandu choose Bright Smile — and keep coming back for a lifetime of dental care.', 'home', 'why_choose', 'Why Choose intro paragraph');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.why_choose.cta_label', 'Book your visit', 'home', 'why_choose', 'Why Choose CTA link');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.why_choose.credentials_label', 'Credentials & Registrations', 'home', 'why_choose', 'Credentials strip label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.eyebrow', 'Get Started Today', 'home', 'cta', 'Homepage CTA eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.heading_line1', 'Ready for Your', 'home', 'cta', 'Homepage CTA heading — line 1');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.heading_line2', 'Best Smile?', 'home', 'cta', 'Homepage CTA heading — line 2 (gold)');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.intro', 'Take the first step towards a healthier, more confident smile. Book your consultation today — our team is here to help every step of the way.', 'home', 'cta', 'Homepage CTA intro paragraph');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.book_label', 'Book Appointment', 'home', 'cta', 'Homepage CTA gold button');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.trust_chip_1', 'NMC Registered', 'home', 'cta', 'CTA trust micro-row item 1');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.trust_chip_2', 'Call Before You Commit', 'home', 'cta', 'CTA trust micro-row item 2');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.trust_chip_3', 'No Hidden Charges', 'home', 'cta', 'CTA trust micro-row item 3');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.hours_heading', 'Opening Hours', 'home', 'cta', 'CTA right panel heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.location_heading', 'Location', 'home', 'cta', 'CTA right panel heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.directions_label', 'Get Directions', 'home', 'cta', 'CTA get-directions link');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('home.cta.contact_heading', 'Contact', 'home', 'cta', 'CTA right panel heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.hero.eyebrow_template', 'Founded {year}', 'about', 'hero', 'About hero eyebrow. {year} is replaced with the founding year.');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.hero.headline_line1', 'Our', 'about', 'hero', 'About hero headline — line 1');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.hero.headline_line2', 'Story.', 'about', 'hero', 'About hero headline — line 2');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.hero.description', 'Over a decade of trusted dental care in the heart of Kathmandu — built on expertise, compassion and an uncompromising commitment to every patient.', 'about', 'hero', 'About hero description paragraph');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.story.eyebrow', 'How We Started', 'about', 'story', 'Story section eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.story.mission_label', 'Our Mission', 'about', 'story', 'Mission block label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.story.vision_label', 'Our Vision', 'about', 'story', 'Vision block label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.values.eyebrow', 'What Guides Us', 'about', 'values', 'Values section eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.values.heading', 'Our Values', 'about', 'values', 'Values section heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.why_choose.eyebrow', 'Why Bright Smile', 'about', 'why_choose', 'About Why Choose eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.why_choose.heading', 'What Sets Us Apart', 'about', 'why_choose', 'About Why Choose heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.why_choose.cta_heading', 'Ready to experience the difference?', 'about', 'why_choose', 'Inline CTA heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.why_choose.cta_subtext', 'Join over 1,000 patients who trust Bright Smile for their dental care. Book your first appointment today.', 'about', 'why_choose', 'Inline CTA subtext');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.why_choose.cta_book_label', 'Book an Appointment', 'about', 'why_choose', 'Inline CTA primary button');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('about.why_choose.cta_doctors_label', 'Meet Our Doctors', 'about', 'why_choose', 'Inline CTA secondary button');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.emergency.heading', 'Dental Emergency?', 'contact', 'emergency', 'Emergency banner heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.emergency.text', 'Call us immediately — we do our best to see emergency patients the same day.', 'contact', 'emergency', 'Emergency banner text');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.emergency.cta_label_template', 'Call Now: {phone}', 'contact', 'emergency', 'Emergency banner CTA. {phone} is replaced with the clinic phone number.');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.hero.eyebrow', 'Get in Touch', 'contact', 'hero', 'Contact hero eyebrow');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.hero.headline', 'Let''s talk about your smile.', 'contact', 'hero', 'Contact hero headline (rendered across two lines)');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.hero.description', 'We''re here to answer your questions — no commitment, no pressure. Reach us by phone, WhatsApp, email, or the form.', 'contact', 'hero', 'Contact hero description');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.panel.phone_label', 'Phone', 'contact', 'panel', 'Left panel phone label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.panel.whatsapp_label', 'WhatsApp', 'contact', 'panel', 'Left panel WhatsApp label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.panel.email_label', 'Email', 'contact', 'panel', 'Left panel email label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.panel.address_label', 'Address', 'contact', 'panel', 'Left panel address label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.panel.hours_label', 'Opening Hours', 'contact', 'panel', 'Left panel hours label');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.form.heading', 'Send Us a Message', 'contact', 'form', 'Contact form heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.form.subtext', 'We''ll respond within 24 hours on working days.', 'contact', 'form', 'Contact form subtext');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.form.submit_label', 'Send Message', 'contact', 'form', 'Contact form submit button');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.form.submit_note', 'We respond within 24 hours · Your data is kept private and never shared.', 'contact', 'form', 'Contact form note below submit');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.form.success_heading', 'Message Sent!', 'contact', 'form', 'Contact form success state heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.form.success_subtext_template', 'Thank you, {name}. We''ll get back to you within 24 hours.', 'contact', 'form', 'Contact form success subtext. {name} is replaced with the submitted name.');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.form.send_another_label', 'Send another message', 'contact', 'form', 'Contact form reset link');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.map.heading', 'Find Us', 'contact', 'map', 'Map section heading');
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES ('contact.directions.heading', 'Getting Here', 'contact', 'directions', 'Directions section heading');

-- trust_indicators
INSERT INTO public.trust_indicators (title, description, sort_order) VALUES ('NMC Registered', 'All doctors are registered with the Nepal Medical Council, ensuring the highest professional standards.', 1);
INSERT INTO public.trust_indicators (title, description, sort_order) VALUES ('Modern Technology', 'Digital X-rays, advanced sterilisation and contemporary instruments for safer, more accurate treatment.', 2);
INSERT INTO public.trust_indicators (title, description, sort_order) VALUES ('Gentle & Caring', 'We take time to understand your concerns and ensure every visit is comfortable and unhurried.', 3);
INSERT INTO public.trust_indicators (title, description, sort_order) VALUES ('Transparent Pricing', 'Clear treatment estimates before we begin — no surprises, no hidden costs. Ever.', 4);

-- why_choose_reasons
INSERT INTO public.why_choose_reasons (title, description, sort_order) VALUES ('Experienced Team', '6 NMC-registered dentists and specialists with a combined 40+ years of clinical experience in Kathmandu.', 1);
INSERT INTO public.why_choose_reasons (title, description, sort_order) VALUES ('Modern Equipment', 'Digital X-rays, advanced sterilisation units and contemporary precision instruments for safer, more accurate treatment.', 2);
INSERT INTO public.why_choose_reasons (title, description, sort_order) VALUES ('Personalised Care', 'We take time to understand each patient. Your care plan is designed for you — never a one-size-fits-all approach.', 3);
INSERT INTO public.why_choose_reasons (title, description, sort_order) VALUES ('Specialist Network', 'Access to oral surgeons, periodontists and implantologists — coordinated by your lead dentist, for your convenience.', 4);
INSERT INTO public.why_choose_reasons (title, description, sort_order) VALUES ('Convenient Location', 'Centrally located in Nagpokhari, Naxal — easily accessible from Kathmandu and all surrounding areas.', 5);
INSERT INTO public.why_choose_reasons (title, description, sort_order) VALUES ('Transparent Pricing', 'Full cost estimate before any treatment begins. No surprises, no hidden charges — complete financial clarity, always.', 6);

-- patient_journey_steps
INSERT INTO public.patient_journey_steps (step, title, subtitle, description, sort_order) VALUES (1, 'Book Your Visit', 'Easy scheduling', 'Call, WhatsApp, or use our online form. We confirm your appointment the same day — no long waits.', 1);
INSERT INTO public.patient_journey_steps (step, title, subtitle, description, sort_order) VALUES (2, 'Meet Your Dentist', 'Expert consultation', 'Your lead dentist listens carefully, reviews your history, and performs a thorough oral examination.', 2);
INSERT INTO public.patient_journey_steps (step, title, subtitle, description, sort_order) VALUES (3, 'Diagnosis & Imaging', 'Digital X-rays', 'Where needed, digital X-rays provide instant, high-resolution images with minimal radiation.', 3);
INSERT INTO public.patient_journey_steps (step, title, subtitle, description, sort_order) VALUES (4, 'Your Care Plan', 'Transparent planning', 'We walk you through every recommended treatment, the full timeline, and the cost — before anything begins.', 4);
INSERT INTO public.patient_journey_steps (step, title, subtitle, description, sort_order) VALUES (5, 'Comfortable Treatment', 'Gentle precision', 'Treatment is delivered with a gentle technique, appropriate anaesthesia, and complete focus on your comfort.', 5);
INSERT INTO public.patient_journey_steps (step, title, subtitle, description, sort_order) VALUES (6, 'Follow-Up Care', 'Ongoing support', 'Clear aftercare instructions, a scheduled follow-up check, and a long-term plan to keep your smile healthy.', 6);

-- before_after_cases
INSERT INTO public.before_after_cases (title, category, treatment_details, duration, before_gradient, after_gradient, sort_order) VALUES ('Complete Smile Makeover', 'smile-makeover', 'Porcelain Veneers + Whitening + Gum Contouring', '6 weeks', '#2d1a1a', '#0C3C2D', 1);
INSERT INTO public.before_after_cases (title, category, treatment_details, duration, before_gradient, after_gradient, sort_order) VALUES ('Orthodontic Correction', 'orthodontics', 'Clear Aligners — Full Treatment Course', '18 months', '#1a1a2d', '#0C3C2D', 2);
INSERT INTO public.before_after_cases (title, category, treatment_details, duration, before_gradient, after_gradient, sort_order) VALUES ('Professional Whitening', 'whitening', 'In-Clinic Power Whitening Session', '1 session', '#2d2a1a', '#0C3C2D', 3);
INSERT INTO public.before_after_cases (title, category, treatment_details, duration, before_gradient, after_gradient, sort_order) VALUES ('Dental Implant', 'implants', 'Titanium Implant + Ceramic Crown', '4 months', '#1a2d2d', '#0C3C2D', 4);

-- certifications
INSERT INTO public.certifications (title, issuer, year, type, sort_order) VALUES ('NMC Registered', 'Nepal Medical Council', '2013', 'registration', 1);
INSERT INTO public.certifications (title, issuer, year, type, sort_order) VALUES ('MDS Specialist Verified', 'Nepal Medical Council', '2015', 'registration', 2);
INSERT INTO public.certifications (title, issuer, year, type, sort_order) VALUES ('Advanced Implantology', 'ITI International', '2019', 'certification', 3);
INSERT INTO public.certifications (title, issuer, year, type, sort_order) VALUES ('Aligner Certified Provider', 'Clear Aligner Academy', '2021', 'certification', 4);

-- team_members
INSERT INTO public.team_members (name, role, department, initials, color_hex, sort_order) VALUES ('Jitendra Kumar', 'Senior Dental Hygienist', 'hygienist', 'JK', '#2a5a3d', 1);
INSERT INTO public.team_members (name, role, department, initials, color_hex, sort_order) VALUES ('Parbati Gurung', 'Dental Hygienist', 'hygienist', 'PG', '#3d6b50', 2);
INSERT INTO public.team_members (name, role, department, initials, color_hex, sort_order) VALUES ('Justin Shrestha', 'Dental Assistant', 'assistant', 'JS', '#4A9B6F', 3);
INSERT INTO public.team_members (name, role, department, initials, color_hex, sort_order) VALUES ('Front Desk', 'Reception', 'reception', 'RC', NULL, 4);
INSERT INTO public.team_members (name, role, department, initials, color_hex, sort_order) VALUES ('Admin Team', 'Administration', 'admin', 'AD', NULL, 5);

