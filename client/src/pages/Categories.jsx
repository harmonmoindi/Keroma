import { Link } from "react-router-dom";
import { useMeals } from "../context/mealsContext";

const CATEGORIES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch_dinner", label: "Lunch & Dinner" },
  { key: "snacks", label: "Snacks & Fruits" },
];

export default function Categories() {
  const { meals } = useMeals();
  return (
    <main className="home">
      <header className="home-header">
        <h1>KEROMA</h1>
        <p>Kenyan Aroma</p>
      </header>

      <nav className="tiles">
        {CATEGORIES.map((c) => {
          const items = meals.filter((m) => m.category === c.key);
          const cover = items[0];
          return (
            <Link
              key={c.key}
              to={`/gallery/${c.key}`}
              className={`tile ${c.key}`}
              style={cover ? { "--img": `url("${cover.image_url}")` } : undefined}
            >
              <span className="tile-label">{c.label}</span>
              <span className="tile-count">{items.length} meals</span>
            </Link>
          );
        })}
      </nav>
    </main>
  );
}