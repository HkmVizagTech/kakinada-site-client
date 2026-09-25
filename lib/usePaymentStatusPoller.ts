// usePaymentStatusPoller — polls GET /payments/status/:orderId until the
// backend confirms the webhook completed the donation, then calls onCompleted.
//
// Usage: call startPolling(orderId) immediately after the Razorpay order is
// created (just before the checkout widget opens). If the donor pays and
// comes back without the frontend success handler firing (common with UPI —
// they pay in PhonePe/GPay and go back), this catches the webhook-triggered
// completion and redirects them to the thank-you page automatically.
//
// The poller is always running while the checkout is open. If the frontend
// handler DID fire and called onCompleted itself, stopPolling() cleans up.

import { useCallback, useEffect, useRef } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

interface PollResult {
  found: boolean;
  completed: boolean;
  receiptReady: boolean;
  whatsappSent: boolean;
  amount: number;
  sevaName?: string;
}

interface UsePaymentStatusPollerOptions {
  /** Called when the backend confirms the donation is completed. */
  onCompleted: (result: PollResult) => void;
  /** Poll interval in ms. Default: 4000 (4 seconds). */
  intervalMs?: number;
  /** Max total time to poll before giving up in ms. Default: 300000 (5 min). */
  maxDurationMs?: number;
}

export function usePaymentStatusPoller({
  onCompleted,
  intervalMs = 4000,
  maxDurationMs = 300_000,
}: UsePaymentStatusPollerOptions) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const activeOrderIdRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    activeOrderIdRef.current = null;
  }, []);

  const startPolling = useCallback(
    (orderId: string) => {
      stopPolling(); // clear any previous poller
      if (!orderId) return;

      activeOrderIdRef.current = orderId;
      startedAtRef.current = Date.now();

      timerRef.current = setInterval(async () => {
        // Stop automatically if we've been polling too long (payment probably
        // genuinely failed or was abandoned, not just slow).
        if (Date.now() - startedAtRef.current > maxDurationMs) {
          stopPolling();
          return;
        }

        // Bail if the orderId changed (new checkout started).
        if (activeOrderIdRef.current !== orderId) return;

        try {
          const res = await fetch(`${API_URL}/payments/status/${orderId}`);
          if (!res.ok) return; // server error — just retry next interval

          const data: PollResult = await res.json();
          if (data.completed) {
            stopPolling();
            onCompleted(data);
          }
        } catch {
          // Network error — silently retry next interval
        }
      }, intervalMs);
    },
    [stopPolling, onCompleted, intervalMs, maxDurationMs]
  );

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  return { startPolling, stopPolling };
}
