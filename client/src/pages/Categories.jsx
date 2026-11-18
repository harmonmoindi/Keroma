import { Link } from "react-router-dom";
import { useMeals } from "../context/mealsContext";
import { useAuth } from "../context/authContext";

const CATEGORIES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch_dinner", label: "Lunch & Dinner" },
  { key: "snacks", label: "Snacks & Fruits" },
  { key: "pets", label: "Pets", comingSoon: true },
];

export default function Categories() {
  const { logout } = useAuth();
  const { meals } = useMeals();
  return (
    <main className="home">
      <header className="home-header">
        <h1>KEROMA</h1>
        <p>Kenyan Aroma</p>
        <button className="link-btn" onClick={logout}>Log out</button>
      </header>

      <nav className="tiles">
        {CATEGORIES.map((c) => {
          if (c.comingSoon) {
            return (
              <div
                key={c.key}
                className={`tile ${c.key} coming-soon`}
                aria-disabled="true"
              >
                <span className="tile-label">{c.label}</span>
                <span className="tile-count">Coming soon</span>
              </div>
            );
          }
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