import { Link } from "react-router-dom";
import { getMeals } from "../data/sessionMeals";

export default function Landing() {
  const cover = getMeals()[0];

  return (
    <main className="landing" style={{ "--img": `url("${cover.image_url}")` }}>
      <div className="landing-content">
        <h1>KEROMA</h1>
        <p className="tagline">Kenyan Aroma</p>
        <p className="pitch">
          Can't decide what to eat? Browse home-cooked Kenyan meals until
          something looks right.
        </p>
        <Link to="/categories" className="cta">
          Get started
        </Link>
      </div>
    </main>
  );
}