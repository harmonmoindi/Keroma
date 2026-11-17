const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.msg || `Request failed (${res.status})`);
  }
  return data;
}

function postJson(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const fetchMeals = () => request("/api/meals");
export const login = (email, password) => postJson("/api/login", { email, password });
export const signup = (email, password) => postJson("/api/signup", { email, password });
export const fetchMe = (token) =>
  request("/api/me", { headers: { Authorization: `Bearer ${token}` } });
export const forgotPassword = (email) =>
  postJson("/api/forgot-password", { email });
export const resetPassword = (token, password) =>
  postJson("/api/reset-password", { token, password });