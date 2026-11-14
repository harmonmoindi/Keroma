const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function fetchMeals() {
  const res = await fetch(`${API_URL}/api/meals`);
  if (!res.ok) throw new Error(`Server responded with ${res.status}`);
  return res.json();
}