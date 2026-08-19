"use client";

// Preloads the Razorpay checkout.js script as soon as a donation page
// mounts, instead of the old pattern of loading it only after the donor
// clicks "Donate" (which stacked script-download time sequentially AFTER
// the order-creation API call, doubling the wait before the checkout
// modal could appear). By starting the download the moment the page
// loads — while the donor is still filling in the form, which takes
// several seconds — the script is almost always already cached and ready
// by the time they submit, so `ready()` resolves instantly in the
// checkout handler instead of adding its own network wait on top of the
// order API call.
//
// Usage:
//   const razorpayReady = useRazorpayPreload();
//   ...
//   const createRes = await fetch(...);   // order creation
//   await razorpayReady();                // near-instant if already preloaded
//   new window.Razorpay(options).open();

import { useCallback, useEffect, useRef } from "react";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export function useRazorpayPreload() {
  const readyPromiseRef = useRef<Promise<void> | null>(null);

  const ensureLoading = useCallback(() => {
    if (readyPromiseRef.current) return readyPromiseRef.current;

    readyPromiseRef.current = new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return resolve();
      if ((window as any).Razorpay) return resolve();

      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (existing) {
        if ((window as any).Razorpay) return resolve();
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay checkout script")));
        return;
      }

      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
      document.body.appendChild(script);
    });

    return readyPromiseRef.current;
  }, []);

  // Kick off the download immediately on mount — don't wait for a click.
  useEffect(() => {
    ensureLoading().catch(() => {
      // Swallow here; the checkout handler's own await will surface the
      // error at submit time if the script genuinely never loads.
    });
  }, [ensureLoading]);

  // What submit handlers call — resolves instantly if preload already
  // finished (the common case), otherwise waits for the in-flight load.
  return ensureLoading;
}
