-- 1. identify each meal by its image file name (stable, unlike the full URL)
ALTER TABLE meals ADD COLUMN IF NOT EXISTS file_name TEXT;
UPDATE meals SET file_name = substring(image_url from '[^/]+$') WHERE file_name IS NULL;
ALTER TABLE meals ALTER COLUMN file_name SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS meals_file_name_key ON meals (file_name);

-- 2. allow the upcoming pets category
ALTER TABLE meals DROP CONSTRAINT IF EXISTS meals_category_check;
ALTER TABLE meals ADD CONSTRAINT meals_category_check
  CHECK (category IN ('breakfast', 'lunch_dinner', 'snacks', 'pets'));