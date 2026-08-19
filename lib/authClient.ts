"use client";

// Cross-domain auth helper.
//
// The frontend (vercel.app) and backend (railway.app) are on different
// domains, so the login cookie is a "third-party" cookie from the
// browser's point of view. Safari (ITP), Firefox (strict mode), and an
// increasing share of Chrome now block or partition third-party cookies
// by default — which silently breaks cookie-only auth: login can appear
// to succeed once, then bounce back to /admin/login on the very next
// page load or refresh because the session cookie was never actually
// stored by the browser.
//
// Fix: store the JWT in localStorage and send it as a Bearer token on
// every admin request, in addition to the cookie. The backend's
// authMiddleware already accepts either.

const TOKEN_KEY = "hkm_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/**
 * Drop-in replacement for fetch() that adds the stored Bearer token
 * (if any) alongside the cookie, so admin requests keep working even
 * when the browser blocks the cross-site cookie.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });
}
