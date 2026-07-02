-- ============================================================
-- Correction: patient_journey_steps.subtitle was seeded from
-- PATIENT_JOURNEY_STATIC.subtitle, but PatientJourneySection.tsx
-- actually renders a different, locally-hardcoded sublabel
-- (ARRIVAL_LABELS map) that PATIENT_JOURNEY_STATIC.subtitle was
-- never wired to. Fixing the seed to match what's genuinely live
-- on the site today, so wiring the component to read `subtitle`
-- directly from the DB causes zero visual change.
-- ============================================================

UPDATE public.patient_journey_steps SET subtitle = 'Your welcome begins' WHERE step = 1;
UPDATE public.patient_journey_steps SET subtitle = 'We listen first' WHERE step = 2;
UPDATE public.patient_journey_steps SET subtitle = 'Clarity through expertise' WHERE step = 3;
UPDATE public.patient_journey_steps SET subtitle = 'Designed around you' WHERE step = 4;
UPDATE public.patient_journey_steps SET subtitle = 'Comfortable precision' WHERE step = 5;
UPDATE public.patient_journey_steps SET subtitle = 'We stay with you' WHERE step = 6;
