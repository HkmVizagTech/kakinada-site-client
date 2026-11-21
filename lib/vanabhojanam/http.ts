import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { VB_API } from "./config";

// The Vanabhojanam console keeps its own session, separate from the temple's /admin login
// (staff volunteers and devotees are not temple admins).
const TOKEN_KEY = "vb_token";
const ROLE_KEY = "vb_role";

const safe = <T,>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null; // storage can be blocked (private mode, disabled cookies)
  }
};

export const session = {
  getToken: () => (typeof window === "undefined" ? null : safe(() => localStorage.getItem(TOKEN_KEY))),
  getRole: () => (typeof window === "undefined" ? null : safe(() => localStorage.getItem(ROLE_KEY))),
  save: ({ token, role }: { token: string; role: string }) =>
    safe(() => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ROLE_KEY, role);
    }),
  saveRole: (role: string) => safe(() => localStorage.setItem(ROLE_KEY, role)),
  clear: () =>
    safe(() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
    }),
};

declare module "axios" {
  interface AxiosRequestConfig {
    /** Do not log the user out when this request answers 401/403 (login and token checks). */
    skipAuthRedirect?: boolean;
  }
}

export const http = axios.create({ baseURL: VB_API, timeout: 30000 });

let onUnauthorized: (() => void) | null = null;
/** The auth provider registers a handler so an expired session logs the user out everywhere. */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = session.getToken();
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if ((status === 401 || status === 403) && hadToken && !error.config?.skipAuthRedirect) onUnauthorized?.();
    return Promise.reject(error);
  }
);

/** Best human-readable message from an axios/Error failure. */
export const getErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
  const e = error as AxiosError<{ message?: string; error?: string }> & { message?: string };
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    (e?.code === "ERR_NETWORK" ? "Network error, please try again." : null) ||
    e?.message ||
    fallback
  );
};

export const isCancel = axios.isCancel;

/** Admin list endpoints answer with a bare array or one of several wrapper keys. */
export const unwrapList = <T = any,>(data: any, keys: string[] = ["candidates", "records"]): T[] => {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return [];
};
