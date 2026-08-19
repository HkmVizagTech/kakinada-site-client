// lib/tracking.ts
//
// Captures UTM parameters (or a referrer-based fallback) on page load and
// stores them in sessionStorage so they survive navigation within the same
// visit, then reads them back when submitting a donation. Ported from
// subhojanam-client's tracking.js (the proven annadan.harekrishnavizag.org
// pattern) — same priority order: UTM params > ref/slug param > referrer
// auto-detect > direct.

export interface TrackingData {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
}

const STORAGE_KEY = "hkm_utm";

function detectReferrerSource(): { source: string; medium: string } {
  if (typeof document === "undefined" || !document.referrer) {
    return { source: "direct", medium: "none" };
  }
  try {
    const url = new URL(document.referrer);
    const host = url.hostname.toLowerCase();

    if (host.includes("facebook.com") || host.includes("fb.com")) return { source: "facebook", medium: "social" };
    if (host.includes("instagram.com")) return { source: "instagram", medium: "social" };
    if (host.includes("whatsapp.com") || host.includes("wa.me")) return { source: "whatsapp", medium: "social" };
    if (host.includes("google.")) return { source: "google", medium: "organic" };
    if (host.includes("youtube.com")) return { source: "youtube", medium: "social" };
    if (host.includes("twitter.com") || host.includes("t.co") || host.includes("x.com")) return { source: "twitter", medium: "social" };
    if (host.includes("linkedin.com")) return { source: "linkedin", medium: "social" };

    return { source: host, medium: "referral" };
  } catch {
    return { source: "unknown", medium: "referral" };
  }
}

/**
 * Reads UTM/ref params from the current URL, or falls back to a stored
 * value from earlier in the session, or auto-detects from the referrer.
 * Call this once on mount of any donation entry-point page.
 */
export function captureTracking(): TrackingData {
  if (typeof window === "undefined") {
    return { source: "", medium: "", campaign: "", content: "", term: "" };
  }

  const params = new URLSearchParams(window.location.search);

  const hasUtm = params.get("utm_source") || params.get("utm_campaign");
  if (hasUtm) {
    const data: TrackingData = {
      source: params.get("utm_source") || "unknown",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || "",
      content: params.get("utm_content") || "",
      term: params.get("utm_term") || "",
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  const refParam = params.get("ref") || params.get("via");
  if (refParam) {
    const data: TrackingData = { source: "link", medium: "referral", campaign: refParam, content: "", term: "" };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  // Already captured earlier this session (user navigated within the site)
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.source) return parsed;
    }
  } catch {}

  const { source, medium } = detectReferrerSource();
  const data: TrackingData = { source, medium, campaign: "", content: "", term: "" };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

/** Reads previously-captured tracking data without re-detecting anything. */
export function getStoredTracking(): TrackingData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
