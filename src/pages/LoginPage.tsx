import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnonymousLogin() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/magic-link/start", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Failed to start guest login");
      }

      // redirect to magic link
      window.location.href = data.login_link;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = "http://127.0.0.1:8000/auth/google/login";
  }

  return (
    <div className="page-stack">
      <div className="panel" style={{ maxWidth: 480, margin: "80px auto" }}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">Welcome</p>
            <h1>Login to Language App</h1>
            <p className="muted">
              Choose a login method to continue
            </p>
          </div>
        </div>

        <div className="form" style={{ gap: 16 }}>
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

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <p className="muted" style={{ fontSize: 12 }}>
            Guest accounts expire after 30 days of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
}