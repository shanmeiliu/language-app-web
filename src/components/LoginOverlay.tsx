import { useState } from "react";
import { apiUrl } from "../lib/api";


export default function LoginOverlay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnonymousLogin() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/auth/magic-link/start"), {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Failed to start guest login");
      }

      window.location.href = data.login_link;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = apiUrl("/auth/google/login");
  }

  return (
    <div className="login-overlay">
      <div className="login-overlay-card">
        <p className="eyebrow">Welcome</p>
        <h2>Sign in to use AI Flashcards</h2>
        <p className="muted">
          Explore phrase practice, topic generation, and challenge mode.
        </p>

        <div className="overlay-action-stack">
          <button
            className="primary-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Continue with Google
          </button>

          <button
            className="secondary-button"
            onClick={handleAnonymousLogin}
            disabled={loading}
          >
            {loading ? "Starting..." : "Continue as Guest"}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <p className="overlay-footnote muted">
          Guest accounts expire after 30 days of inactivity.
        </p>
      </div>
    </div>
  );
}