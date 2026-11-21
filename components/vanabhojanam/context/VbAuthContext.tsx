"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { authApi } from "@/lib/vanabhojanam/api";
import { session, setUnauthorizedHandler } from "@/lib/vanabhojanam/http";

/**
 * status: 'anonymous' | 'unverified' (token found, not yet checked) | 'checking' | 'authenticated'
 * Verification is lazy: public pages never hit the token-check endpoint.
 * role: 'admin' (temple admin) | 'user' (volunteer) | 'viewer' (devotee, read-only)
 */
export interface VbAuthState {
  status: "anonymous" | "unverified" | "checking" | "authenticated";
  role: string | null;
  userId: string | null;
  name: string;
  isSuperAdmin: boolean;
  canCollectCash: boolean;
}

interface VbAuthValue extends VbAuthState {
  login: (credentials: { email: string; password: string }) => Promise<string>;
  loginWithToken: (data: { token: string; role: string; id: string; name: string }) => void;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<VbAuthValue | null>(null);

const anonymous: VbAuthState = { status: "anonymous", role: null, userId: null, name: "", isSuperAdmin: false, canCollectCash: false };

const initialState = (): VbAuthState => {
  const token = session.getToken();
  const role = session.getRole();
  return token && role ? { ...anonymous, status: "unverified", role } : anonymous;
};

export function VbAuthProvider({ children }: { children: ReactNode }) {
  // Always start anonymous on the server and first client render (no hydration mismatch), then read storage.
  const [state, setState] = useState<VbAuthState>(anonymous);
  const inFlight = useRef(false);

  useEffect(() => {
    setState(initialState());
  }, []);

  const logout = useCallback(() => {
    session.clear();
    setState(anonymous);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const verify = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState((prev) => ({ ...prev, status: "checking" }));
    try {
      const data = await authApi.me();
      const { role, id, name, isSuperAdmin, canCollectCash } = data.user;
      session.saveRole(role);
      setState({ status: "authenticated", role, userId: id, name, isSuperAdmin: Boolean(isSuperAdmin), canCollectCash: Boolean(canCollectCash) });
    } catch {
      logout();
    } finally {
      inFlight.current = false;
    }
  }, [logout]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const data = await authApi.login(credentials);
    session.save({ token: data.token, role: data.role });
    setState({ status: "authenticated", role: data.role, userId: data.id, name: data.name, isSuperAdmin: Boolean(data.isSuperAdmin), canCollectCash: Boolean(data.canCollectCash) });
    return data.role as string;
  }, []);

  // Devotees sign in with a WhatsApp code instead of a password; the server answers with the same token shape.
  const loginWithToken = useCallback((data: { token: string; role: string; id: string; name: string }) => {
    session.save({ token: data.token, role: data.role });
    setState({ status: "authenticated", role: data.role, userId: data.id, name: data.name, isSuperAdmin: false, canCollectCash: false });
  }, []);

  const value = useMemo(() => ({ ...state, login, loginWithToken, logout, verify }), [state, login, loginWithToken, logout, verify]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useVbAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useVbAuth must be used inside <VbAuthProvider>");
  return ctx;
};

/** Where each role lands after signing in. */
export const homeForRole = (role: string | null) => {
  if (role === "admin" || role === "viewer") return "/vanabhojanam/admin";
  if (role === "user") return "/vanabhojanam/admin/AdminAttendanceScannedList";
  return "/vanabhojanam";
};
