// useScrollToDonate — scrolls to the donation form section on page load.
// Used on every donation/seva page so that when a donor arrives via an
// ad CTA or WhatsApp broadcast link they land directly at the form
// instead of the top of the page (which is a hero image/text they've
// already seen in the ad).
//
// Looks for id="donate" (most pages) or id="checkout-form" (Janmashtami).
// A short delay lets the page finish painting first.

import { useEffect } from "react";

export function useScrollToDonate(targetId: string = "donate", delayMs: number = 400) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [targetId, delayMs]);
}
