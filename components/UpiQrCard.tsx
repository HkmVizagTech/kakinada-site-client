"use client";

// UPI QR payment card — replicates the "Scan & Pay with any UPI app" panel
// from annadan.harekrishnavizag.org, restyled to this site's saffron/gold
// theme. Open-amount QR: the donor enters the amount in their own UPI app.
//
// Payment details are the temple's live UPI credentials (same as the
// Annadan site). The QR encodes a standard `upi://pay` string so PhonePe,
// Google Pay, Paytm, BHIM, and any UPI app can scan it.

import { useState } from "react";
import { QrCode, Copy, Check } from "lucide-react";

// Temple UPI credentials (matches annadan.harekrishnavizag.org)
const UPI_VPA = "hkmivsp9.08@idfcbank";
const PAYEE_NAME = "HARE KRISHNA MOVEMENT INDIA";

// Open-amount UPI intent string (no `am=` so donor sets the amount).
const UPI_STRING = `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(PAYEE_NAME)}&cu=INR`;
const QR_IMG = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(UPI_STRING)}`;

export default function UpiQrCard({ note }: { note?: string }) {
  const [copied, setCopied] = useState(false);

  const copyVpa = () => {
    navigator.clipboard.writeText(UPI_VPA).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="rounded-2xl border border-gold/40 bg-gradient-to-b from-[hsl(42,90%,97%)] to-white p-5 text-center shadow-[var(--shadow-gold)] md:p-6">
      <div className="mb-1 flex items-center justify-center gap-2">
        <QrCode className="h-4 w-4 text-gold" />
        <h3 className="font-heading text-base font-bold text-primary">Pay via UPI QR</h3>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">Scan &amp; pay with any UPI app</p>

      <div className="mx-auto mb-4 inline-flex rounded-xl border border-gold/30 bg-white p-2.5 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={QR_IMG}
          alt="Scan to pay via PhonePe, Google Pay, Paytm or any UPI app"
          width={220}
          height={220}
          className="h-[220px] w-[220px] rounded-md"
        />
      </div>

      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        PhonePe · Google Pay · Paytm · BHIM
      </p>

      <p className="mb-1.5 text-xs text-muted-foreground">or pay to this UPI ID</p>
      <button
        onClick={copyVpa}
        className="mx-auto flex w-full max-w-xs items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-colors hover:border-gold"
        aria-label="Copy UPI ID"
      >
        <span className="truncate font-semibold text-foreground">{UPI_VPA}</span>
        {copied ? (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-green-600">
            <Check className="h-3.5 w-3.5" /> Copied
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-gold">
            <Copy className="h-3.5 w-3.5" /> Copy
          </span>
        )}
      </button>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        {note ||
          "After paying by UPI, please WhatsApp us your payment screenshot with your name and PAN (for 80G) so we can send your receipt."}
      </p>
    </div>
  );
}
