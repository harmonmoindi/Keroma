import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { sendFeedback } from "../data/api";
import { FEEDBACK_ENABLED } from "../config";

export default function Feedback() {
  const [rating, setRating] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!FEEDBACK_ENABLED) return <Navigate to="/categories" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await sendFeedback(rating, message.trim());
      setSent(true);
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

  if (sent) {
    return (
      <main className="auth">
        <div className="auth-card">
          <h1>KEROMA</h1>
          <p className="auth-message">Thank you! Your feedback was sent.</p>
          <Link to="/categories" className="cta">
            Back to meals
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>KEROMA</h1>
        <p className="tagline">Tell me what you think</p>

        <div className="rating" role="group" aria-label="Rating (optional)">
          <p>How are you finding the app? (optional)</p>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              className={`star ${rating >= n ? "on" : ""}`}
              aria-label={`${n} out of 5`}
              aria-pressed={rating === n}
              onClick={() => setRating(rating === n ? null : n)}
            >
              ★
            </button>
          ))}
        </div>

        <label>
          Your feedback
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            rows={6}
            required
          />
        </label>
        <p className="counter">{message.length}/2000</p>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="cta" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send feedback"}
        </button>

        <Link to="/categories">← Back</Link>
      </form>
    </main>
  );
}