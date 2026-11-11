import { meals } from "../src/data/meals.js";

let bad = 0;
for (const m of meals) {
  const res = await fetch(m.image_url, { method: "HEAD" });
  if (!res.ok) {
    bad++;
    console.log(`${res.status}  ${m.name}  ${m.image_url}`);
  }
}
console.log(bad === 0 ? `All ${meals.length} images OK` : `${bad} broken of ${meals.length}`);