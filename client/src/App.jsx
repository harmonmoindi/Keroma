import { Routes, Route } from "react-router-dom";
import MealsProvider from "./context/MealsProvider";
import { useMeals } from "./context/mealsContext";
import Landing from "./pages/Landing";
import Categories from "./pages/Categories";
import Gallery from "./pages/Gallery";

function Gate({ children }) {
  const { status } = useMeals();

  if (status === "loading") {
    return <p className="status">Loading meals…</p>;
  }
  if (status === "error") {
    return (
      <p className="status">
        Couldn't load the meals. Check that the server is running, then refresh.
      </p>
    );
  }
  return children;
}

export default function App() {
  return (
    <MealsProvider>
      <Gate>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/gallery/:category" element={<Gallery />} />
        </Routes>
      </Gate>
    </MealsProvider>
  );
}