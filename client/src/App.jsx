import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Categories from "./pages/Categories";
import Gallery from "./pages/Gallery";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/gallery/:category" element={<Gallery />} />
    </Routes>
  );
}