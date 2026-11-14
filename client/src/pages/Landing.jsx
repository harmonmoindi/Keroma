import { Link } from "react-router-dom";
import { getMeals } from "../data/sessionMeals";

// small square version of the image, so the mosaic loads fast
const thumb = (url) => url.replace("c_limit,w_1200", "c_fill,g_auto,w_500,h_500");

export default function Landing() {
  const tiles = getMeals().slice(0, 20);

  return (
    <main className="landing">
      <div className="mosaic" aria-hidden="true">
        {tiles.map((m) => (
          <img key={m.id} src={thumb(m.image_url)} alt="" />
        ))}
      </div>

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