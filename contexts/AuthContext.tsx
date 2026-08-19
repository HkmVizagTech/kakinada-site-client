"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authFetch, setToken, clearToken } from "@/lib/authClient";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; name: string; role: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // authFetch attaches the stored Bearer token alongside the cookie,
        // so this still works even if the cross-site cookie was blocked.
        const res = await authFetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"}/users/profile`);
        if (res.ok) {
          const data = await res.json();
          setUser({ email: data.user.email, name: data.user.name, role: data.user.role });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.token) setToken(data.token); // localStorage fallback for cross-site cookie blocking
      setUser({ email: data.user.email, name: data.user.name, role: data.user.role });
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await authFetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")}/users/logout`, { method: "POST" });
    } catch {}
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
