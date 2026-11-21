"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { candidatesApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { vbToast } from "@/lib/vanabhojanam/hooks";
import { formatDateTime, formatINR } from "@/lib/vanabhojanam/format";
import { VbAlert, VbBadge } from "../../ui/Feedback";
import { VbButton } from "../../ui/Button";

const ISSUE_LABELS: Record<string, string> = {
  captured_not_marked_paid: "Paid at Razorpay, not marked Paid here",
  not_captured_at_razorpay: "Marked Paid here, nothing at Razorpay",
  amount_differs: "Amount differs",
  refunded_at_razorpay_only: "Refunded at Razorpay only",
  refunded_here_only: "Marked Refunded here only",
  lookup_failed: "Could not check",
};

const Figure = ({ label, value, hint, accent, negative, plain }: { label: string; value: number; hint?: string; accent?: boolean; negative?: boolean; plain?: boolean }) => (
  <div className={cn("rounded-xl border p-4", accent ? "border-orange-200 bg-orange-50" : "border-black/10 bg-black/5")}>
    <p className="text-sm text-gray-600">{label}</p>
    <p className={cn("text-2xl font-bold leading-[1.2]", accent ? "text-orange-700" : negative && "text-red-500")}>
      {plain ? value : `${negative ? "− " : ""}${formatINR(value)}`}
    </p>
    {hint && <p className="text-xs text-gray-600">{hint}</p>}
  </div>
);

/** "Check with Razorpay": proves the dashboard money matches Razorpay, and lists every registration that does not. */
export default function RazorpayCheck({ eventId }: { eventId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    setLoading(true);
    try {
      setResult(await candidatesApi.auditPayments(eventId));
    } catch (error) {
      vbToast({ title: "Razorpay check failed", description: getErrorMessage(error), status: "error", duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const open = () => {
    setIsOpen(true);
    run();
  };

  const settle = async () => {
    setSettling(true);
    try {
      const outcome = await candidatesApi.checkPending();
      vbToast({ title: outcome.message, status: "success", duration: 4000 });
      await run();
    } catch (error) {
      vbToast({ title: "Could not settle payments", description: getErrorMessage(error), status: "error", duration: 6000 });
    } finally {
      setSettling(false);
    }
  };

  const needsSettling = result?.issues.some((i: any) => i.type === "captured_not_marked_paid");

  return (
    <>
      <VbButton variant="outline" leftIcon={<ShieldCheck size={16} />} onClick={open}>Check with Razorpay</VbButton>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl bg-white p-0 text-gray-900">
          <div className="px-6 pb-2 pt-5 pr-12">
            <DialogTitle className="text-lg font-semibold">Razorpay reconciliation</DialogTitle>
            <DialogDescription className="text-sm font-normal text-gray-600">Kartika Vanabhojanam payments checked against your Razorpay account</DialogDescription>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
            {loading && !result ? (
              <p className="text-gray-600">Asking Razorpay about every online payment. This can take a moment...</p>
            ) : (
              result && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Figure label="Payments matched" value={result.razorpay.payments} plain />
                    <Figure label="Collected" value={result.razorpay.captured - result.razorpay.refunded} hint={result.razorpay.refunded ? `after ${formatINR(result.razorpay.refunded)} refunded` : undefined} />
                    <Figure label="Razorpay fees" value={result.razorpay.fees} negative hint="includes GST" />
                    <Figure label="Net to bank" value={result.razorpay.netToBank} accent />
                  </div>

                  {result.repaired > 0 && (
                    <VbAlert status="success">Repaired {result.repaired} registration{result.repaired === 1 ? "" : "s"} that were missing their payment link-up.</VbAlert>
                  )}
                  <VbAlert status={result.matches ? "success" : "warning"}>
                    {result.matches
                      ? "Every paid registration has a matching Razorpay payment, and the totals agree."
                      : `${result.issues.length} registration${result.issues.length === 1 ? "" : "s"} to look at. Dashboard minus Razorpay: ${formatINR(result.difference)}.`}
                  </VbAlert>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Figure label="Dashboard: paid online" value={result.dashboard.paidOnline} hint={`Refunded here: ${formatINR(result.dashboard.refunded)}`} />
                    <Figure label="Razorpay: received (net of refunds)" value={result.razorpay.net} hint={`Captured ${formatINR(result.razorpay.captured)}`} />
                    <Figure label="Cash at the desk" value={result.dashboard.cash} hint="Not in Razorpay; counted separately" />
                  </div>

                  {result.issues.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-gray-600">
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Problem</th>
                            <th className="px-3 py-2 text-right">Here</th>
                            <th className="px-3 py-2 text-right">Razorpay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.issues.map((issue: any) => (
                            <tr key={issue.id} className="border-b border-black/5 align-top">
                              <td className="px-3 py-2">
                                <p className="font-semibold">{issue.name}</p>
                                <p className="text-xs text-gray-600">{issue.phone}</p>
                              </td>
                              <td className="px-3 py-2">
                                <VbBadge color="orange" className="whitespace-normal">{ISSUE_LABELS[issue.type] || issue.type}</VbBadge>
                                <p className="mt-1 text-xs text-gray-600">{issue.detail}</p>
                              </td>
                              <td className="px-3 py-2 text-right">{issue.ourStatus}<br />{formatINR(issue.ourAmount)}</td>
                              <td className="px-3 py-2 text-right">{issue.razorpayStatus}<br />{formatINR(issue.razorpayAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {result.otherPayments > 0 && (
                    <p className="text-sm text-gray-600">{result.otherPayments.toLocaleString("en-IN")} other payments on this Razorpay account (donations, other seva) were ignored.</p>
                  )}
                  <p className="text-xs text-gray-600">Checked {formatDateTime(result.checkedAt)}.</p>
                  <div className="flex flex-wrap gap-3">
                    {needsSettling && <VbButton variant="success" onClick={settle} loading={settling}>Settle pending payments</VbButton>}
                    <VbButton variant="outline" onClick={run} loading={loading}>Check again</VbButton>
                  </div>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
