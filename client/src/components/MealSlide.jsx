// tiny version of the photo, used only for the blurred backdrop
const backdrop = (url) =>
  url.replace("c_limit,w_1200", "c_fill,g_auto,w_80,h_80,q_auto");

export default function MealSlide({ meal }) {
  return (
    <figure
      className="slide"
      style={{ "--img": `url("${backdrop(meal.image_url)}")` }}
    >
      <img src={meal.image_url} alt={meal.name} loading="lazy" />
      <figcaption className="name">{meal.name}</figcaption>
    </figure>
  );
}