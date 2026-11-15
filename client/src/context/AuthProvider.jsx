import { useEffect, useState } from "react";
import { fetchMe, login as apiLogin, signup as apiSignup } from "../data/api";
import { useMeals } from "./mealsContext";
import { AuthContext } from "./authContext";

const TOKEN_KEY = "keroma_token";

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
}
function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export default function AuthProvider({ children }) {
  const { reshuffle } = useMeals();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(readToken()));

  // on page load, if a token is saved, ask the server who it belongs to
  useEffect(() => {
    const saved = readToken();
    if (!saved) return;

    let cancelled = false;
    fetchMe(saved)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => clearToken())
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function authenticate(call, email, password) {
    const data = await call(email, password);
    saveToken(data.token);
    setUser(data.user);
    reshuffle();
  }

  const value = {
    user,
    checking,
    login: (email, password) => authenticate(apiLogin, email, password),
    signup: (email, password) => authenticate(apiSignup, email, password),
    logout: () => {
      clearToken();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}