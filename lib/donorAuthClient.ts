"use client";

// Same cross-domain token pattern as lib/authClient.ts (that one is for
// admin/preacher staff sessions), kept completely separate here since a
// donor session is a different kind of token ({donorId, type:"donor"})
// verified by a different middleware — never mix these two token stores.

const TOKEN_KEY = "hkm_donor_token";

export function getDonorToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setDonorToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearDonorToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function donorFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getDonorToken();
  const headers = new Headers(init.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
