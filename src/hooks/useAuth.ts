import { useEffect, useState } from "react";
import { apiUrl } from "../lib/api";

export type AuthUser = {
  user_id: string;
  account_type: string;
  email?: string | null;
  username: string;
  display_name?: string | null;
  is_active: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const res = await fetch(apiUrl("/auth/me"), {
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