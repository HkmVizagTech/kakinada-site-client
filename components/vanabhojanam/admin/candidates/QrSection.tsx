"use client";

import { useEffect, useState } from "react";
import { QrCode, Send } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { candidatesApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { vbToast } from "@/lib/vanabhojanam/hooks";
import { VbButton } from "../../ui/Button";
import { needsApproval } from "./needsApproval";

/** Lets an admin show a person's entry QR on screen, or resend it on WhatsApp, when they have lost it. */
export default function QrSection({ candidate: c }: { candidate: any }) {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState("");

  useEffect(() => setToken(null), [c._id]);

  const eligible = c.paymentStatus === "Paid" && (!needsApproval(c) || c.adminAction === "Accepted");
  if (!eligible) {
    return needsApproval(c) && c.paymentStatus === "Paid" ? (
      <p className="text-sm text-gray-600">The entry QR is issued once you accept this student&apos;s ID.</p>
    ) : null;
  }

  const show = async () => {
    setBusy("show");
    try {
      setToken((await candidatesApi.qr(c._id)).attendanceToken);
    } catch (error) {
      vbToast({ title: "Could not load the QR", description: getErrorMessage(error), status: "error", duration: 5000 });
    } finally {
      setBusy("");
    }
  };

  const send = async () => {
    setBusy("send");
    try {
      const result = await candidatesApi.sendQr(c._id);
      vbToast({ title: result.message, status: "success", duration: 3000 });
    } catch (error) {
      vbToast({ title: "QR not sent", description: getErrorMessage(error), status: "error", duration: 6000 });
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Entry QR</h3>
      <div className="flex flex-wrap gap-3">
        <VbButton size="sm" variant="outline" leftIcon={<QrCode size={16} />} onClick={show} loading={busy === "show"}>
          {token ? "Refresh QR" : "Show QR"}
        </VbButton>
        <VbButton
          size="sm"
          variant="outline"
          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          leftIcon={<Send size={16} />}
          onClick={send}
          loading={busy === "send"}
        >
          Send on WhatsApp
        </VbButton>
      </div>
      {token && (
        <div className="mt-4 flex flex-col items-start gap-2">
          <div className="rounded-lg border border-black/10 bg-white p-3 shadow-sm">
            <QRCodeSVG value={token} size={176} />
          </div>
          <p className="text-xs text-gray-600">Staff only. Scan this at the gate; please do not share the screen.</p>
        </div>
      )}
    </div>
  );
}
