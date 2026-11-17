import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Login() {
  const { user, checking, login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (checking) return <p className="status">Checking your session…</p>;
  if (user) return <Navigate to="/categories" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await (mode === "login" ? login : signup)(email, password);
      // on success `user` is set, and the redirect above takes over
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Can't reach the server. Please try again."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>KEROMA</h1>
        <p className="tagline">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? 8 : undefined}
            required
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="cta" type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button type="button" className="link-btn" onClick={switchMode}>
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Log in"}
        </button>

        {mode === "login" && <Link to="/forgot-password">Forgot password?</Link>}
        <Link to="/">← Back</Link>
      </form>
    </main>
  );
}