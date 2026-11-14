DROP TABLE IF EXISTS meal_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS meals;

CREATE TABLE meals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('breakfast', 'lunch_dinner', 'snacks')),
  image_url TEXT NOT NULL UNIQUE
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE meal_tags (
  meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (meal_id, tag_id)
);
