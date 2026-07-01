-- Service items (treatments) table — one row per sub-service within a category
CREATE TABLE IF NOT EXISTS service_items (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID        NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  sort_order  INT         NOT NULL DEFAULT 0,
  is_visible  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_items_category ON service_items(category_id, sort_order);

ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage service items"
  ON service_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public read visible service items"
  ON service_items FOR SELECT TO anon
  USING (is_visible = true);

-- Seed from existing static data (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM service_items LIMIT 1) THEN
    INSERT INTO service_items (category_id, name, description, sort_order)
    SELECT sc.id, v.name, v.description, v.sort_order
    FROM (VALUES
      -- General Dentistry
      ('general-dentistry', 'Comprehensive Dental Exams',   'Full oral health assessment including gum, tooth and soft tissue evaluation.', 10),
      ('general-dentistry', 'Professional Cleaning',        'Removal of plaque, tartar and surface stains for a fresh, clean smile.',        20),
      ('general-dentistry', 'Tooth-Coloured Fillings',      'Natural-looking composite resin fillings that blend seamlessly with your teeth.', 30),
      ('general-dentistry', 'Root Canal Treatment',         'Effective relief from tooth pain and infection — preserving your natural tooth.', 40),
      ('general-dentistry', 'Tooth Extractions',            'Gentle removal of damaged or impacted teeth when necessary.',                    50),
      ('general-dentistry', 'Gum Care & Scaling',           'Scaling and root planing to treat early-stage gum disease and prevent progression.', 60),
      -- Cosmetic Dentistry
      ('cosmetic-dentistry', 'Professional Teeth Whitening', 'Clinically supervised whitening for noticeably brighter results.',              10),
      ('cosmetic-dentistry', 'Dental Veneers',               'Ultra-thin porcelain shells that correct shape, colour and minor alignment issues.', 20),
      ('cosmetic-dentistry', 'Composite Bonding',            'Tooth-coloured resin applied to repair chips, gaps or discolouration.',         30),
      ('cosmetic-dentistry', 'Smile Design',                 'A planned, holistic approach to redesigning your entire smile.',                40),
      ('cosmetic-dentistry', 'Gum Contouring',               'Reshaping of the gum line to create a more balanced, aesthetic smile.',         50),
      -- Orthodontics
      ('orthodontics', 'Metal Braces',       'Highly effective and durable — ideal for complex cases and younger patients.', 10),
      ('orthodontics', 'Ceramic Braces',     'Tooth-coloured brackets for a less noticeable appearance during treatment.',  20),
      ('orthodontics', 'Clear Aligners',     'Virtually invisible, removable trays that gradually shift teeth into alignment.', 30),
      ('orthodontics', 'Retainers',          'Custom retainers to maintain your results after active treatment.',             40),
      ('orthodontics', 'Space Maintainers',  'Paediatric devices to preserve spacing for developing adult teeth.',            50),
      -- Oral Surgery
      ('oral-surgery', 'Wisdom Tooth Removal', 'Surgical extraction of impacted or problematic wisdom teeth.',            10),
      ('oral-surgery', 'Complex Extractions',  'Removal of severely broken, decayed or difficult teeth.',                  20),
      ('oral-surgery', 'Surgical Biopsy',      'Removal and analysis of soft tissue for diagnostic purposes.',              30),
      ('oral-surgery', 'Frenectomy',           'Minor surgery to correct tongue-tie or lip-tie conditions.',                40),
      ('oral-surgery', 'Cyst Removal',         'Surgical removal of jaw cysts with minimal bone disturbance.',              50),
      -- Dental Implants
      ('dental-implants', 'Single Tooth Implant',      'A titanium implant topped with a custom ceramic crown for a seamless result.', 10),
      ('dental-implants', 'Multiple Implants',         'Individual implants to replace several missing teeth independently.',           20),
      ('dental-implants', 'Implant-Supported Bridge',  'A bridge anchored to implants — no need to alter healthy adjacent teeth.',     30),
      ('dental-implants', 'All-on-4 / All-on-6',      'Full-arch rehabilitation for patients missing all or most teeth.',              40),
      ('dental-implants', 'Bone Grafting',             'Jaw bone augmentation to support successful implant placement where needed.',   50),
      -- Pediatric Dentistry
      ('pediatric-dentistry', 'First Dental Visit (Age 1)', 'A gentle, exploratory visit that establishes a positive relationship with dentistry.', 10),
      ('pediatric-dentistry', 'Dental Sealants',            'Protective coating on back teeth to prevent cavities in high-risk areas.',            20),
      ('pediatric-dentistry', 'Fluoride Treatment',         'Professional fluoride application to strengthen developing enamel.',                   30),
      ('pediatric-dentistry', 'Children''s Fillings',       'Tooth-coloured fillings placed gently to preserve primary teeth.',                    40),
      ('pediatric-dentistry', 'Space Maintainers',          'Devices to preserve spacing for permanent teeth after early tooth loss.',              50),
      ('pediatric-dentistry', 'Habit Counselling',          'Guidance on thumb-sucking, pacifier use and age-appropriate oral hygiene.',            60)
    ) AS v(slug, name, description, sort_order)
    JOIN service_categories sc ON sc.slug = v.slug;
  END IF;
END $$;
