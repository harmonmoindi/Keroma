import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../data/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
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

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>KEROMA</h1>
        <p className="tagline">Reset your password</p>

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

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="cta" type="submit" disabled={busy}>
          {busy ? "Please wait…" : "Send reset link"}
        </button>

        <Link to="/login">← Back to log in</Link>
      </form>
    </main>
  );
}