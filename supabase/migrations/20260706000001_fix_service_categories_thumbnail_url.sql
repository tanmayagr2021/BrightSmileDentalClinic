-- service_categories.thumbnail_url has been defined in
-- 20260609000005_service_tables.sql since the original table creation, but
-- is absent from the live database (confirmed via direct REST query:
-- "column service_categories.thumbnail_url does not exist"). The migration
-- file and the live schema diverged at some point prior to this fix. This
-- re-adds the column defensively (IF NOT EXISTS) so it matches what every
-- other migration and the application code already assume exists.
ALTER TABLE service_categories
  ADD COLUMN IF NOT EXISTS thumbnail_url text;
