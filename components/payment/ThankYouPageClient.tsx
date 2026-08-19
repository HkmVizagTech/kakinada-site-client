"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Home, ArrowRight } from "lucide-react";

export default function ThankYouPageClient() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") === "seva" ? "seva" : "donation";
  const sevaName = searchParams.get("seva") || searchParams.get("title") || "your offering";
  const amount = searchParams.get("amount");
  const source = searchParams.get("source") || "our temple services";

  const heading = type === "seva"
    ? "Thank You for Your Seva!"
    : "Thank You for Your Donation!";

  const message = amount
    ? `Your ${type === "seva" ? "seva" : "donation"} for ${sevaName} has been received successfully. We are grateful for your support to ${source}.`
    : `Your ${type === "seva" ? "seva" : "donation"} has been received successfully. We are grateful for your support to ${source}.`;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fff8e7_0%,#fff3d0_100%)] px-4 py-20 text-slate-950">
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-amber-200/80 bg-white/90 p-8 text-center shadow-2xl shadow-amber-100/70 backdrop-blur md:p-12">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
          Payment confirmed
        </p>
        <h1 className="mb-4 font-heading text-3xl font-bold text-slate-900 md:text-4xl">
          {heading}
        </h1>
        <p className="mb-8 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
          {message}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#0f3b82] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#122f65]"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Explore More Sevas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
