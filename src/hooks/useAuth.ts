import { useEffect, useState } from "react";

export type AuthUser = {
  user_id: string;
  account_type: string;
  email?: string | null;
  username: string;
  is_active: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return {
    user,
    loading,
    refreshUser,
  };
}