-- Add long_description to service_categories for full CMS editing
ALTER TABLE service_categories
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS icon_svg TEXT;
