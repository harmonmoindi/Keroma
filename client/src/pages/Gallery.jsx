import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMeals } from "../data/sessionMeals";
import { shuffle } from "../utils/shuffle";
import MealSlide from "../components/MealSlide";

const TITLES = {
  breakfast: "Breakfast",
  lunch_dinner: "Lunch & Dinner",
  snacks: "Snacks & Fruits",
};

// To add a toggle: add an entry here, and a list for the same key in scripts/tags.mjs
const FILTERS = [
  { key: "healthy", label: "Healthier", message: "You're in the healthy section." },
];

function scrollByPage(el, direction) {
  if (el) el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
}

export default function Gallery() {
  const { category } = useParams();
  const [activeTags, setActiveTags] = useState([]);
  const [shuffled, setShuffled] = useState(null);
  const galleryRef = useRef(null);

  // a freshly shuffled order while a toggle is on, the normal session order otherwise
  const source = shuffled ?? getMeals();
  const list = source.filter(
    (m) => m.category === category && activeTags.every((t) => m.tags.includes(t))
  );

  function toggleTag(key) {
    const next = activeTags.includes(key)
      ? activeTags.filter((t) => t !== key)
      : [...activeTags, key];
    setActiveTags(next);
    setShuffled(next.length > 0 ? shuffle(getMeals()) : null);
  }

  // jump back to the first meal whenever the filter or category changes
  useEffect(() => {
    galleryRef.current?.scrollTo({ left: 0 });
  }, [activeTags, category]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowRight") scrollByPage(galleryRef.current, 1);
      if (e.key === "ArrowLeft") scrollByPage(galleryRef.current, -1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={`gallery-page ${category}`}>
      <header className="gallery-bar">
        <Link to="/categories">← Back</Link>
        <h2>{TITLES[category] ?? "Meals"}</h2>

        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`chip ${activeTags.includes(f.key) ? "on" : ""}`}
              onClick={() => toggleTag(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {FILTERS.filter((f) => activeTags.includes(f.key)).map((f) => (
        <p key={f.key} className="filter-note" role="status">
          {f.message}
        </p>
      ))}

      <div className="gallery-wrap">
        <button
          className="nav-btn prev"
          aria-label="Previous meal"
          onClick={() => scrollByPage(galleryRef.current, -1)}
        >
          ‹
        </button>

        <div className="gallery" ref={galleryRef}>
          {list.length === 0 && (
            <p className="empty">No meals match this filter yet.</p>
          )}
          {list.map((meal) => (
            <MealSlide key={meal.id} meal={meal} />
          ))}
        </div>

        <button
          className="nav-btn next"
          aria-label="Next meal"
          onClick={() => scrollByPage(galleryRef.current, 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}