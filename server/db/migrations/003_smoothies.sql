ALTER TABLE meals DROP CONSTRAINT IF EXISTS meals_category_check;
ALTER TABLE meals ADD CONSTRAINT meals_category_check
  CHECK (category IN ('breakfast', 'lunch_dinner', 'snacks', 'smoothies', 'pets'));