-- ============================================================
-- Migration: Phase 2 — Premium Experience Modules
-- Virtual Clinic Tour, Interactive Tooth Explorer, Trust Wall.
-- Purely additive. Reuses media_library / admin_users / doctors / services.
-- ============================================================

-- ── virtual_tour_rooms ─────────────────────────────────────
CREATE TABLE public.virtual_tour_rooms (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                text        NOT NULL,
    slug                text        NOT NULL UNIQUE,
    description         text,
    thumbnail_media_id  uuid        REFERENCES public.media_library(id) ON DELETE SET NULL,
    panorama_media_id   uuid        REFERENCES public.media_library(id) ON DELETE SET NULL,
    cta_label           text,
    cta_link            text,
    sort_order          integer     NOT NULL DEFAULT 0,
    is_visible          boolean     NOT NULL DEFAULT true,
    created_by          uuid        REFERENCES public.admin_users(id),
    updated_by          uuid        REFERENCES public.admin_users(id),
    created_at          timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at          timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_virtual_tour_rooms
    BEFORE UPDATE ON public.virtual_tour_rooms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.virtual_tour_rooms IS 'One node in the 360 virtual clinic tour. panorama_media_id is the equirectangular 360 image shown fullscreen.';

-- ── virtual_tour_room_gallery ──────────────────────────────
CREATE TABLE public.virtual_tour_room_gallery (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id     uuid        NOT NULL REFERENCES public.virtual_tour_rooms(id) ON DELETE CASCADE,
    media_id    uuid        NOT NULL REFERENCES public.media_library(id) ON DELETE CASCADE,
    sort_order  integer     NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_virtual_tour_room_gallery_room_id ON public.virtual_tour_room_gallery(room_id);

COMMENT ON TABLE public.virtual_tour_room_gallery IS 'Flat gallery photos shown alongside a room (not the 360 panorama itself).';

-- ── virtual_tour_hotspots ──────────────────────────────────
-- A hotspot lives inside room_id's panorama and, on click, navigates
-- the viewer to target_room_id (VirtualTourPlugin "link").
CREATE TABLE public.virtual_tour_hotspots (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         uuid        NOT NULL REFERENCES public.virtual_tour_rooms(id) ON DELETE CASCADE,
    target_room_id  uuid        NOT NULL REFERENCES public.virtual_tour_rooms(id) ON DELETE CASCADE,
    label           text,
    yaw             double precision NOT NULL DEFAULT 0,
    pitch           double precision NOT NULL DEFAULT 0,
    sort_order      integer     NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT virtual_tour_hotspots_no_self_link CHECK (room_id <> target_room_id)
);

CREATE INDEX idx_virtual_tour_hotspots_room_id ON public.virtual_tour_hotspots(room_id);

COMMENT ON TABLE public.virtual_tour_hotspots IS 'Clickable navigation arrows placed at a yaw/pitch position inside a room panorama, linking to another room.';

-- ── teeth ───────────────────────────────────────────────────
-- Fixed reference set of 32 permanent teeth (Universal Numbering
-- System, 1-32), matched 1:1 against the static SVG dental chart.
-- Rows are seeded below and never created/deleted from the admin UI,
-- only their content columns are editable.
CREATE TABLE public.teeth (
    id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    tooth_number   integer     NOT NULL UNIQUE CHECK (tooth_number BETWEEN 1 AND 32),
    fdi_number     text        NOT NULL,
    name           text        NOT NULL,
    arch           text        NOT NULL CHECK (arch IN ('upper', 'lower')),
    quadrant       text        NOT NULL CHECK (quadrant IN ('upper-right', 'upper-left', 'lower-left', 'lower-right')),
    description    text,
    problems       text,
    treatments     text,
    duration_text  text,
    recovery_text  text,
    is_active      boolean     NOT NULL DEFAULT true,
    updated_by     uuid        REFERENCES public.admin_users(id),
    created_at     timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at     timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_teeth
    BEFORE UPDATE ON public.teeth
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.teeth.tooth_number IS 'Universal Numbering System 1-32, matches the static SVG dental chart tooth IDs.';

-- ── tooth_faqs ──────────────────────────────────────────────
CREATE TABLE public.tooth_faqs (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    tooth_id    uuid        NOT NULL REFERENCES public.teeth(id) ON DELETE CASCADE,
    question    text        NOT NULL,
    answer      text        NOT NULL,
    sort_order  integer     NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_tooth_faqs
    BEFORE UPDATE ON public.tooth_faqs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_tooth_faqs_tooth_id ON public.tooth_faqs(tooth_id);

-- ── tooth_images ────────────────────────────────────────────
CREATE TABLE public.tooth_images (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    tooth_id    uuid        NOT NULL REFERENCES public.teeth(id) ON DELETE CASCADE,
    media_id    uuid        NOT NULL REFERENCES public.media_library(id) ON DELETE CASCADE,
    image_type  text        NOT NULL DEFAULT 'gallery' CHECK (image_type IN ('gallery', 'before', 'after')),
    sort_order  integer     NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_tooth_images_tooth_id ON public.tooth_images(tooth_id);

-- ── tooth_doctors / tooth_services junctions ───────────────
CREATE TABLE public.tooth_doctors (
    tooth_id    uuid        NOT NULL REFERENCES public.teeth(id) ON DELETE CASCADE,
    doctor_id   uuid        NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (tooth_id, doctor_id)
);

COMMENT ON TABLE public.tooth_doctors IS 'Junction: which doctors treat a given tooth. Admin-editable per tooth; public page joins live.';

CREATE TABLE public.tooth_services (
    tooth_id    uuid        NOT NULL REFERENCES public.teeth(id) ON DELETE CASCADE,
    service_id  uuid        NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (tooth_id, service_id)
);

COMMENT ON TABLE public.tooth_services IS 'Junction: which services apply to a given tooth. Admin-editable per tooth; public page joins live.';

-- ── trust_wall_items ────────────────────────────────────────
CREATE TABLE public.trust_wall_items (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    module       text        NOT NULL CHECK (module IN ('trust-certifications', 'technology', 'clinical-standards')),
    category     text        NOT NULL CHECK (category IN ('award', 'certification', 'membership', 'equipment', 'sterilization', 'technology', 'research', 'verification')),
    title        text        NOT NULL,
    description  text,
    issuer       text,
    year         text,
    image_id     uuid        REFERENCES public.media_library(id) ON DELETE SET NULL,
    sort_order   integer     NOT NULL DEFAULT 0,
    is_visible   boolean     NOT NULL DEFAULT true,
    created_by   uuid        REFERENCES public.admin_users(id),
    updated_by   uuid        REFERENCES public.admin_users(id),
    created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at   timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_updated_at_trust_wall_items
    BEFORE UPDATE ON public.trust_wall_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON COLUMN public.trust_wall_items.module IS 'Which of the 3 Trust Wall CMS modules (Trust & Certifications / Technology / Clinical Standards) this item belongs to.';
COMMENT ON COLUMN public.trust_wall_items.category IS 'Fine-grained kind within a module: award, certification, membership, equipment, sterilization, technology, research, verification.';

-- ── Storage buckets ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('virtual-tour',    'virtual-tour',    true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('tooth-explorer',  'tooth-explorer',  true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('trust-wall',      'trust-wall',      true, 5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read — virtual-tour"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'virtual-tour');

CREATE POLICY "Public read — tooth-explorer"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'tooth-explorer');

CREATE POLICY "Public read — trust-wall"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'trust-wall');

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.virtual_tour_rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_tour_room_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_tour_hotspots     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teeth                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tooth_faqs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tooth_images              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tooth_doctors             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tooth_services            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_wall_items          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read visible virtual_tour_rooms"
    ON public.virtual_tour_rooms FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage virtual_tour_rooms"
    ON public.virtual_tour_rooms FOR ALL USING (public.is_admin());

CREATE POLICY "Public read virtual_tour_room_gallery"
    ON public.virtual_tour_room_gallery FOR SELECT USING (true);
CREATE POLICY "Admin manage virtual_tour_room_gallery"
    ON public.virtual_tour_room_gallery FOR ALL USING (public.is_admin());

CREATE POLICY "Public read virtual_tour_hotspots"
    ON public.virtual_tour_hotspots FOR SELECT USING (true);
CREATE POLICY "Admin manage virtual_tour_hotspots"
    ON public.virtual_tour_hotspots FOR ALL USING (public.is_admin());

CREATE POLICY "Public read active teeth"
    ON public.teeth FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage teeth"
    ON public.teeth FOR ALL USING (public.is_admin());

CREATE POLICY "Public read tooth_faqs"
    ON public.tooth_faqs FOR SELECT USING (true);
CREATE POLICY "Admin manage tooth_faqs"
    ON public.tooth_faqs FOR ALL USING (public.is_admin());

CREATE POLICY "Public read tooth_images"
    ON public.tooth_images FOR SELECT USING (true);
CREATE POLICY "Admin manage tooth_images"
    ON public.tooth_images FOR ALL USING (public.is_admin());

CREATE POLICY "Public read tooth_doctors"
    ON public.tooth_doctors FOR SELECT USING (true);
CREATE POLICY "Admin manage tooth_doctors"
    ON public.tooth_doctors FOR ALL USING (public.is_admin());

CREATE POLICY "Public read tooth_services"
    ON public.tooth_services FOR SELECT USING (true);
CREATE POLICY "Admin manage tooth_services"
    ON public.tooth_services FOR ALL USING (public.is_admin());

CREATE POLICY "Public read visible trust_wall_items"
    ON public.trust_wall_items FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage trust_wall_items"
    ON public.trust_wall_items FOR ALL USING (public.is_admin());

-- ── Seed: 32 permanent teeth (Universal Numbering System) ──
INSERT INTO public.teeth (tooth_number, fdi_number, name, arch, quadrant) VALUES
    (1,  '18', 'Upper Right 3rd Molar (Wisdom Tooth)', 'upper', 'upper-right'),
    (2,  '17', 'Upper Right 2nd Molar',                'upper', 'upper-right'),
    (3,  '16', 'Upper Right 1st Molar',                'upper', 'upper-right'),
    (4,  '15', 'Upper Right 2nd Premolar',             'upper', 'upper-right'),
    (5,  '14', 'Upper Right 1st Premolar',             'upper', 'upper-right'),
    (6,  '13', 'Upper Right Canine',                   'upper', 'upper-right'),
    (7,  '12', 'Upper Right Lateral Incisor',          'upper', 'upper-right'),
    (8,  '11', 'Upper Right Central Incisor',          'upper', 'upper-right'),
    (9,  '21', 'Upper Left Central Incisor',           'upper', 'upper-left'),
    (10, '22', 'Upper Left Lateral Incisor',           'upper', 'upper-left'),
    (11, '23', 'Upper Left Canine',                    'upper', 'upper-left'),
    (12, '24', 'Upper Left 1st Premolar',               'upper', 'upper-left'),
    (13, '25', 'Upper Left 2nd Premolar',               'upper', 'upper-left'),
    (14, '26', 'Upper Left 1st Molar',                  'upper', 'upper-left'),
    (15, '27', 'Upper Left 2nd Molar',                  'upper', 'upper-left'),
    (16, '28', 'Upper Left 3rd Molar (Wisdom Tooth)',   'upper', 'upper-left'),
    (17, '38', 'Lower Left 3rd Molar (Wisdom Tooth)',   'lower', 'lower-left'),
    (18, '37', 'Lower Left 2nd Molar',                  'lower', 'lower-left'),
    (19, '36', 'Lower Left 1st Molar',                  'lower', 'lower-left'),
    (20, '35', 'Lower Left 2nd Premolar',               'lower', 'lower-left'),
    (21, '34', 'Lower Left 1st Premolar',               'lower', 'lower-left'),
    (22, '33', 'Lower Left Canine',                     'lower', 'lower-left'),
    (23, '32', 'Lower Left Lateral Incisor',            'lower', 'lower-left'),
    (24, '31', 'Lower Left Central Incisor',            'lower', 'lower-left'),
    (25, '41', 'Lower Right Central Incisor',           'lower', 'lower-right'),
    (26, '42', 'Lower Right Lateral Incisor',           'lower', 'lower-right'),
    (27, '43', 'Lower Right Canine',                    'lower', 'lower-right'),
    (28, '44', 'Lower Right 1st Premolar',               'lower', 'lower-right'),
    (29, '45', 'Lower Right 2nd Premolar',               'lower', 'lower-right'),
    (30, '46', 'Lower Right 1st Molar',                  'lower', 'lower-right'),
    (31, '47', 'Lower Right 2nd Molar',                  'lower', 'lower-right'),
    (32, '48', 'Lower Right 3rd Molar (Wisdom Tooth)',   'lower', 'lower-right')
ON CONFLICT (tooth_number) DO NOTHING;
