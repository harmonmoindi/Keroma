export default function MealSlide({ meal }) {
  return (
    <figure className="slide" style={{ "--img": `url("${meal.image_url}")` }}>
      <img src={meal.image_url} alt={meal.name} loading="lazy" />
      <figcaption className="name">{meal.name}</figcaption>
    </figure>
  );
}