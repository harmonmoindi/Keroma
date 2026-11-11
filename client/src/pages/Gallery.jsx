import { useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMeals } from "../data/sessionMeals";
import MealSlide from "../components/MealSlide";

const TITLES = {
  breakfast: "Breakfast",
  lunch_dinner: "Lunch & Dinner",
  snacks: "Snacks & Fruits",
};

function scrollByPage(el, direction) {
  if (el) el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
}

export default function Gallery() {
  const { category } = useParams();
  const list = getMeals().filter((m) => m.category === category);
  const galleryRef = useRef(null);

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
        <Link to="/">← Back</Link>
        <h2>{TITLES[category] ?? "Meals"}</h2>
      </header>

      <div className="gallery-wrap">
        <button
          className="nav-btn prev"
          aria-label="Previous meal"
          onClick={() => scrollByPage(galleryRef.current, -1)}
        >
          ‹
        </button>

        <div className="gallery" ref={galleryRef}>
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