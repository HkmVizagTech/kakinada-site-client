// lib/metaPixel.ts
//
// Browser-side Meta (Facebook) Pixel helpers. The base pixel snippet is
// injected once in app/layout.tsx; these helpers fire specific events and,
// crucially, generate a shared event_id per conversion so the browser
// Purchase event can be deduplicated against the server-side CAPI event
// (see server/src/services/metaCapi.service.js).
//
// The Pixel ID is read from NEXT_PUBLIC_META_PIXEL_ID. If it's not set,
// every helper is a safe no-op.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[] };

function getFbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { fbq?: Fbq };
  return w.fbq || null;
}

/** Generate a unique event_id shared between the browser and server events. */
export function newEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Read a cookie value by name (used for _fbp / _fbc). */
export function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

/**
 * Returns the Meta browser identifiers to send to the server so the CAPI
 * event can match this browser session and attribute the ad click.
 * _fbc is only present if the user arrived via an ad (fbclid in URL); Meta's
 * pixel writes it to the _fbc cookie automatically.
 */
export function getMetaBrowserData(): { fbp: string; fbc: string } {
  return { fbp: getCookie("_fbp"), fbc: getCookie("_fbc") };
}

/** Standard event: someone landed on a page. Fired automatically on route change. */
export function trackPageView(): void {
  const fbq = getFbq();
  if (fbq) fbq("track", "PageView");
}

/** Standard event: someone opened the donation/checkout form. */
export function trackInitiateCheckout(params?: { value?: number; content_name?: string }): void {
  const fbq = getFbq();
  if (!fbq) return;
  fbq("track", "InitiateCheckout", {
    currency: "INR",
    value: params?.value || 0,
    content_name: params?.content_name || "Donation",
  });
}

/**
 * Standard event: a donation succeeded. Pass the SAME eventId that was sent
 * to the server at order creation, so Meta dedupes the browser + CAPI events.
 */
export function trackPurchase(params: {
  value: number;
  eventId: string;
  content_name?: string;
}): void {
  const fbq = getFbq();
  if (!fbq) return;
  fbq(
    "track",
    "Purchase",
    {
      currency: "INR",
      value: params.value,
      content_name: params.content_name || "Donation",
    },
    { eventID: params.eventId }
  );
}
