import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";



export default function MagicLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setError("Invalid login link");
      return;
    }

    async function redeem() {
      try {
        const res = await fetch(
          apiUrl(`/auth/magic-link/redeem?token=${token}`),
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.detail || "Login failed");
        }

        navigate("/");
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      }
    }

    redeem();
  }, []);

  return (
    <div className="page-stack">
      <div className="panel" style={{ maxWidth: 480, margin: "80px auto" }}>
        <h2>{error ? "Login Failed" : "Logging you in..."}</h2>

        {error && (
          <>
            <p className="muted">{error}</p>
            <button
              className="primary-button"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}