"use client";

import { useCallback, useState } from "react";
import { candidatesApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { vbToast } from "@/lib/vanabhojanam/hooks";
import { ACTION_COPY, type CandidateAction } from "./constants";

// What the row will look like once the server agrees. Applied at once so the admin never waits for WhatsApp / Razorpay.
const expectedPatch = (action: CandidateAction): Record<string, any> => {
  const now = new Date().toISOString();
  if (action === "accept") return { adminAction: "Accepted", adminActionDate: now };
  if (action === "reject") return { adminAction: "Rejected", adminActionDate: now };
  return { adminAction: "Refunded", adminActionDate: now, paymentStatus: "Refunded" };
};

/**
 * Accept / reject / refund flow: accept and reject run at once, a refund asks first; show the result straight away (optimistic), call the API in the
 * background, then replace the guess with the server's row, or put the old values back if the call failed.
 */
export function useCandidateActions({
  onUpdated, getCandidate, onStart,
}: {
  onUpdated: (id: string, patch: Record<string, any>) => void;
  getCandidate?: (id: string) => any;
  onStart?: () => void;
}) {
  const [pending, setPending] = useState<{ action: CandidateAction; candidateId: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const cancel = useCallback(() => setPending(null), []);

  const run = useCallback(
    async (action: CandidateAction, candidateId: string) => {
      setBusyId(candidateId);
      onStart?.(); // the detail popup closes at once
      const guess = { ...expectedPatch(action), _busy: true }; // _busy greys the row until the server has finished
      const before = getCandidate?.(candidateId);
      const undo = before ? { ...Object.fromEntries(Object.keys(guess).map((key) => [key, before[key]])), _busy: false } : null;
      onUpdated(candidateId, guess);
      try {
        const result = await candidatesApi.act(action, candidateId);
        onUpdated(candidateId, { ...result.data, _busy: false });
        // The server explains a partial outcome (for example a rejection whose refund failed): show that instead of plain success.
        const partial = result.refund === "failed";
        vbToast({
          title: partial ? "Rejected, but the refund failed" : ACTION_COPY[action].done,
          description: partial ? result.message : undefined,
          status: partial ? "warning" : "success",
          duration: partial ? 8000 : 3000,
        });
      } catch (error) {
        onUpdated(candidateId, undo || { _busy: false });
        vbToast({ title: `Failed to ${action} candidate`, description: getErrorMessage(error), status: "error", duration: 5000 });
      } finally {
        setBusyId(null);
      }
    },
    [onUpdated, getCandidate, onStart]
  );

  // Accept and reject go straight through; only a refund (money back, cannot be undone) asks first.
  const request = useCallback(
    (action: CandidateAction, candidateId: string) => (action === "refund" ? setPending({ action, candidateId }) : run(action, candidateId)),
    [run]
  );

  const confirm = useCallback(() => {
    if (!pending) return;
    const { action, candidateId } = pending;
    setPending(null); // close the confirmation now; the API call carries on in the background
    run(action, candidateId);
  }, [pending, run]);

  return { pending, busyId, request, cancel, confirm };
}
