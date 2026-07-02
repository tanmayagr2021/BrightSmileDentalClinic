-- ============================================================
-- Corrections/additions to content_blocks discovered while wiring
-- components to read from the DB (sub-phase 1). No visual change —
-- these are keys that either didn't exist yet or were seeded with
-- the wrong shape for how the component actually renders them.
-- ============================================================

-- contact.hero.headline was seeded as one string, but ContactClient
-- renders it as two separate lines around a <br/> — split to match.
DELETE FROM public.content_blocks WHERE key = 'contact.hero.headline';
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES
    ('contact.hero.headline_line1', 'Let''s talk about', 'contact', 'hero', 'Contact hero headline — line 1'),
    ('contact.hero.headline_line2', 'your smile.', 'contact', 'hero', 'Contact hero headline — line 2');

-- Newly discovered during wiring — not in the original inventory pass.
INSERT INTO public.content_blocks (key, value, page, section, description) VALUES
    ('home.before_after.duration_label_template', 'Treatment duration: {duration}', 'home', 'before_after', 'Case card duration line. {duration} is replaced with the case''s duration value.'),
    ('contact.directions.car_label', 'By Car', 'contact', 'directions', 'Directions card label'),
    ('contact.directions.car_desc', 'Enter Nagpokhari from the Naxal main road. The clinic is visible from the road with clear signage. Parking is available nearby.', 'contact', 'directions', 'Directions card description'),
    ('contact.directions.bus_label', 'By Bus', 'contact', 'directions', 'Directions card label'),
    ('contact.directions.bus_desc', 'Micro-buses and tempos run frequently to Naxal from Ratnapark and Putalisadak. Get off at Nagpokhari stop.', 'contact', 'directions', 'Directions card description'),
    ('contact.directions.foot_label', 'On Foot', 'contact', 'directions', 'Directions card label'),
    ('contact.directions.foot_desc', 'A 10-minute walk from Naxal Bhagwati temple. We are located in a well-known area — locals can direct you.', 'contact', 'directions', 'Directions card description'),
    ('contact.back_home_label', '← Back to home', 'contact', 'directions', 'Link back to homepage below directions');
