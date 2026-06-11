-- ============================================================
-- Migration Phase N: contact email optional, about_content,
-- blog category seeds, and services sub-treatments
-- ============================================================

-- 1. Allow NULL email on contact_submissions
ALTER TABLE public.contact_submissions ALTER COLUMN email DROP NOT NULL;

-- 2. Add about_content JSONB column to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_content jsonb;

-- 3. Seed about_content into the existing site_settings row
UPDATE public.site_settings
SET about_content = '{"founded":"2013","story":"Bright Smile Dental Clinic was founded in 2013 by Dr. Sachin Agrawal with a single vision: to provide dental care of the highest quality to every patient who walks through our doors.\n\nWhat started as a modest practice has grown into one of Kathmandu''s most trusted dental clinics, with a team of 6 specialist dentists, modern equipment, and over 1,000 happy patients served.\n\nOur philosophy is simple: every patient deserves excellent dental care delivered with genuine warmth. We believe a healthy smile has the power to transform lives — and we are privileged to be part of those transformations every day.","mission":"To provide exceptional dental care that improves lives — through clinical excellence, genuine compassion, and an unwavering commitment to patient comfort.","vision":"To be Kathmandu''s most trusted dental clinic — where every patient feels valued, every visit is comfortable, and every smile reflects our dedication to their health.","values":[{"title":"Excellence","description":"We pursue the highest clinical standards through continuous learning and precision in every procedure."},{"title":"Compassion","description":"We listen, we care and we treat every patient as we would a member of our own family."},{"title":"Integrity","description":"Honest diagnosis, transparent costs and no unnecessary treatment — ever."},{"title":"Innovation","description":"Modern techniques and contemporary equipment for safer, more effective outcomes."}],"why_choose_us":["6 experienced, NMC-registered dentists and specialists","10+ years serving Kathmandu and surrounding communities","Modern digital X-ray and advanced sterilisation equipment","Gentle approach — especially for anxious and paediatric patients","Clear, upfront pricing — no surprises","Convenient location in Nagpokhari, Naxal, Kathmandu"]}'::jsonb
WHERE about_content IS NULL;

-- 4. Seed blog categories
INSERT INTO public.blog_categories (name, slug, description, sort_order) VALUES
  ('Dental Tips',  'dental-tips',  'Practical oral health advice and preventive care guides.', 1),
  ('Treatments',   'treatments',   'Insights into dental procedures and what to expect.',      2),
  ('Clinic News',  'clinic-news',  'Clinic updates, new services and team news.',              3)
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed sub-services into services table
INSERT INTO public.services (category_id, name, slug, short_description, sort_order, is_active)
SELECT sc.id, v.name, v.slug, v.descr, v.sorder, true
FROM public.service_categories sc
JOIN (VALUES
  ('general-dentistry','Comprehensive Dental Exams','gen-comprehensive-exams','Full oral health assessment including gum, tooth and soft tissue evaluation.',1),
  ('general-dentistry','Professional Cleaning','gen-professional-cleaning','Removal of plaque, tartar and surface stains for a fresh, clean smile.',2),
  ('general-dentistry','Tooth-Coloured Fillings','gen-tooth-fillings','Natural-looking composite resin fillings that blend seamlessly with your teeth.',3),
  ('general-dentistry','Root Canal Treatment','gen-root-canal','Effective relief from tooth pain and infection — preserving your natural tooth.',4),
  ('general-dentistry','Tooth Extractions','gen-tooth-extractions','Gentle removal of damaged or impacted teeth when necessary.',5),
  ('general-dentistry','Gum Care & Scaling','gen-gum-scaling','Scaling and root planing to treat early-stage gum disease and prevent progression.',6),
  ('cosmetic-dentistry','Professional Teeth Whitening','cos-teeth-whitening','Clinically supervised whitening for noticeably brighter results.',1),
  ('cosmetic-dentistry','Dental Veneers','cos-dental-veneers','Ultra-thin porcelain shells that correct shape, colour and minor alignment issues.',2),
  ('cosmetic-dentistry','Composite Bonding','cos-composite-bonding','Tooth-coloured resin applied to repair chips, gaps or discolouration.',3),
  ('cosmetic-dentistry','Smile Design','cos-smile-design','A planned, holistic approach to redesigning your entire smile.',4),
  ('cosmetic-dentistry','Gum Contouring','cos-gum-contouring','Reshaping of the gum line to create a more balanced, aesthetic smile.',5),
  ('orthodontics','Metal Braces','orth-metal-braces','Highly effective and durable — ideal for complex cases and younger patients.',1),
  ('orthodontics','Ceramic Braces','orth-ceramic-braces','Tooth-coloured brackets for a less noticeable appearance during treatment.',2),
  ('orthodontics','Clear Aligners','orth-clear-aligners','Virtually invisible, removable trays that gradually shift teeth into alignment.',3),
  ('orthodontics','Retainers','orth-retainers','Custom retainers to maintain your results after active treatment.',4),
  ('orthodontics','Space Maintainers','orth-space-maintainers','Paediatric devices to preserve spacing for developing adult teeth.',5),
  ('oral-surgery','Wisdom Tooth Removal','surg-wisdom-tooth','Surgical extraction of impacted or problematic wisdom teeth.',1),
  ('oral-surgery','Complex Extractions','surg-complex-extractions','Removal of severely broken, decayed or difficult teeth.',2),
  ('oral-surgery','Surgical Biopsy','surg-biopsy','Removal and analysis of soft tissue for diagnostic purposes.',3),
  ('oral-surgery','Frenectomy','surg-frenectomy','Minor surgery to correct tongue-tie or lip-tie conditions.',4),
  ('oral-surgery','Cyst Removal','surg-cyst-removal','Surgical removal of jaw cysts with minimal bone disturbance.',5),
  ('dental-implants','Single Tooth Implant','imp-single-tooth','A titanium implant topped with a custom ceramic crown for a seamless result.',1),
  ('dental-implants','Multiple Implants','imp-multiple','Individual implants to replace several missing teeth independently.',2),
  ('dental-implants','Implant-Supported Bridge','imp-bridge','A bridge anchored to implants — no need to alter healthy adjacent teeth.',3),
  ('dental-implants','All-on-4 / All-on-6','imp-all-on-four','Full-arch rehabilitation for patients missing all or most teeth.',4),
  ('dental-implants','Bone Grafting','imp-bone-grafting','Jaw bone augmentation to support successful implant placement where needed.',5),
  ('pediatric-dentistry','First Dental Visit','ped-first-visit','A gentle, exploratory visit that establishes a positive relationship with dentistry.',1),
  ('pediatric-dentistry','Dental Sealants','ped-sealants','Protective coating on back teeth to prevent cavities in high-risk areas.',2),
  ('pediatric-dentistry','Fluoride Treatment','ped-fluoride','Professional fluoride application to strengthen developing enamel.',3),
  ('pediatric-dentistry','Children''s Fillings','ped-fillings','Tooth-coloured fillings placed gently to preserve primary teeth.',4),
  ('pediatric-dentistry','Habit Counselling','ped-habit-counselling','Guidance on thumb-sucking, pacifier use and age-appropriate oral hygiene.',5)
) AS v(cat_slug, name, slug, descr, sorder) ON sc.slug = v.cat_slug
ON CONFLICT (slug) DO NOTHING;
