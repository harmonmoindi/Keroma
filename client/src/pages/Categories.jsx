import { Link } from "react-router-dom";

export default function Categories() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ color: "var(--accent)" }}>Keroma</h1>
      <p style={{ color: "var(--muted)" }}>Kenyan Aroma</p>
      <nav style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        <Link to="/gallery/breakfast">Breakfast</Link>
        <Link to="/gallery/lunch_dinner">Lunch &amp; Dinner</Link>
        <Link to="/gallery/snacks">Snacks &amp; Fruits</Link>
      </nav>
    </main>
  );
}