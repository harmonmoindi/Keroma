import { useParams, Link } from "react-router-dom";
import { meals } from "../data/meals";
import MealSlide from "../components/MealSlide";

const TITLES = {
  breakfast: "Breakfast",
  lunch_dinner: "Lunch & Dinner",
  snacks: "Snacks & Fruits",
};

export default function Gallery() {
  const { category } = useParams();
  const list = meals.filter((m) => m.category === category);

  return (
    <div className={`gallery-page ${category}`}>
      <header className="gallery-bar">
        <Link to="/">← Back</Link>
        <h2>{TITLES[category] ?? "Meals"}</h2>
      </header>
      <div className="gallery">
        {list.map((meal) => (
          <MealSlide key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
}