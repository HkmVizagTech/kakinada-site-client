// lib/useAttribution.ts
//
// One hook to give every donation flow consistent attribution. It:
//   1. Captures UTM params (or referrer fallback) once on mount, storing
//      them in sessionStorage via the existing lib/tracking.ts utility.
//   2. Returns a helper that produces the { sourcePage, utm } fields to
//      spread directly into any create-order request body.
//
// Usage in a donation flow:
//   const attribution = useAttribution("subhojanam");
//   ...
//   body: JSON.stringify({ amount, ...attribution.payload() })
//
// This means UTM + sourcePage capture is identical across all flows and
// nobody has to remember to wire it up per-page ever again.

import { useEffect, useRef } from "react";
import { captureTracking, getStoredTracking, type TrackingData } from "./tracking";

export interface AttributionPayload {
  sourcePage: string;
  utm: TrackingData;
}

/**
 * @param sourcePage A stable identifier for the page the donation originated
 *   from (e.g. "subhojanam", "janmashtami", "seva:anna-daan"). Stored on the
 *   donation record so every transaction is traceable to its origin page.
 */
export function useAttribution(sourcePage: string) {
  // Capture UTM exactly once per mount, before any submit can happen.
  const captured = useRef(false);
  useEffect(() => {
    if (!captured.current) {
      captureTracking();
      captured.current = true;
    }
  }, []);

  /**
   * Returns the attribution fields to spread into a create-order body.
   * Reads the freshest stored tracking at submit time (in case the donor
   * navigated after mount), falling back to a fresh capture if needed.
   */
  const payload = (): AttributionPayload => {
    const utm =
      getStoredTracking() ||
      captureTracking() || { source: "", medium: "", campaign: "", content: "", term: "" };
    return { sourcePage, utm };
  };

  return { payload, sourcePage };
}
