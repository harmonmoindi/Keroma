import { Routes, Route } from "react-router-dom";
import Categories from "./pages/Categories";
import Gallery from "./pages/Gallery";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Categories />} />
      <Route path="/gallery/:category" element={<Gallery />} />
    </Routes>
  );
}