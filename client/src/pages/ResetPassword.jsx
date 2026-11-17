import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../data/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
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

  if (!token) {
    return (
      <main className="auth">
        <div className="auth-card">
          <h1>KEROMA</h1>
          <p className="auth-error">
            This reset link is incomplete. Please request a new one.
          </p>
          <Link to="/forgot-password">Request a new link</Link>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="auth">
        <div className="auth-card">
          <h1>KEROMA</h1>
          <p className="auth-message">Your password has been updated.</p>
          <Link to="/login" className="cta">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>KEROMA</h1>
        <p className="tagline">Choose a new password</p>

        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label>
          Confirm new password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="cta" type="submit" disabled={busy}>
          {busy ? "Please wait…" : "Update password"}
        </button>
      </form>
    </main>
  );
}