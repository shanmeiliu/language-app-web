import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiUrl } from "../lib/api";


export default function RequireAuth({ children }: { children: any }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
      fetch("http://127.0.0.1:8000/auth/me", {
        credentials: "include",
      })
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 40 }}>Checking session...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}