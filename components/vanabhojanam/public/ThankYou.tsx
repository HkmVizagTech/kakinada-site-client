"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CalendarDays, CalendarPlus, CheckCircle2, IdCard, Mail, MapPin, MessageCircle, Navigation, Phone, QrCode, XCircle,
} from "lucide-react";
import { registrationApi } from "@/lib/vanabhojanam/api";
import { BASE_PATH, EVENT, HIGHLIGHTS, IMAGES } from "@/lib/vanabhojanam/config";
import { downloadEventIcs } from "@/lib/vanabhojanam/event";
import { formatINR } from "@/lib/vanabhojanam/format";
import { VbButton, vbButtonClass } from "../ui/Button";
import PublicShell from "../ui/PublicShell";
import { Spinner } from "../ui/Feedback";
import { useCurrentEvent } from "../context/CurrentEventContext";
import Figure from "./Figure";

const MAX_ATTEMPTS = 12;
const POLL_MS = 3000;
// Poll attempts (0-based) at which a still-pending payment is nudged through the immediate verifier.
const NUDGE_ATTEMPTS = [2, 5];

type PayStatus = "loading" | "success" | "failed" | "pending" | "invalid" | "error";

const toStatus = (candidate: any): PayStatus => {
  if (candidate.paymentStatus === "Paid") return "success";
  if (candidate.paymentStatus === "Failed") return "failed";
  return "pending";
};

/** Polls the backend until the payment settles. */
function usePaymentStatus(paymentId?: string) {
  const [state, setState] = useState<{ status: PayStatus; candidate: any }>({ status: "loading", candidate: null });

  useEffect(() => {
    if (!paymentId) return undefined;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempt = 0;
    let candidate: any = null;

    const fetchStatus = async (): Promise<PayStatus> => {
      try {
        const res = await registrationApi.getPaymentStatus(paymentId);
        if (res.data?.success && res.data.candidate) {
          candidate = res.data.candidate;
          return toStatus(candidate);
        }
        return "invalid";
      } catch (err: any) {
        // An unknown payment id is a 404, not a server error.
        if (err?.response?.status === 404) return "invalid";
        console.error("Payment verification error:", err);
        return "error";
      }
    };

    const publish = (status: PayStatus) => {
      if (!cancelled) setState({ status, candidate });
    };

    const tick = async () => {
      let status = await fetchStatus();
      if (cancelled) return;

      if (status === "pending" && NUDGE_ATTEMPTS.includes(attempt) && candidate?.orderId) {
        try {
          const nudge = await registrationApi.verifyImmediately({ orderId: candidate.orderId, paymentId: candidate.paymentId });
          if (nudge?.success) status = await fetchStatus();
        } catch (err) {
          console.error("Immediate verification failed:", err);
        }
        if (cancelled) return;
      }

      publish(status);
      attempt += 1;
      if (status === "success" || status === "failed" || status === "invalid" || attempt >= MAX_ATTEMPTS) return;
      timer = setTimeout(tick, POLL_MS);
    };

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paymentId]);

  return state;
}

function StatusCard({ icon, title, tone, children }: { icon?: ReactNode; title: string; tone: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-20">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-black/10 bg-white p-6 text-center shadow-xl md:p-10">
        {icon}
        <h1 className={`font-vb-heading text-3xl font-semibold ${tone}`}>{title}</h1>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-vb-brand-50 p-3">
      <Icon className="h-5 w-5 shrink-0 text-vb-brand-600" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-600">{children}</p>
      </div>
    </div>
  );
}

function SuccessView({ candidate, paymentId }: { candidate: any; paymentId: string }) {
  const router = useRouter();
  const { event } = useCurrentEvent();
  const isStudent = candidate?.collegeOrWorking === "College" && candidate?.paymentMethod !== "Cash";

  const shareText = encodeURIComponent(
    `I just registered for ${event?.title || EVENT.title}${event ? ` on ${event.dateLabel} at ${event.venue.name}` : ""}. Join me! ${EVENT.registrationUrl}`
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 md:py-10">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-4 animate-vb-rise">
        <div className="relative min-w-[96px]">
          <Image src={IMAGES.logo} alt="Kartika Vanabhojanam logo" width={96} height={96} className="h-24 w-24 rounded-full shadow-lg" unoptimized />
          <span className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </span>
        </div>
        <div>
          <h2 className="font-vb-heading text-3xl font-semibold leading-snug">KARTIKA VANABHOJANAM</h2>
          <p className="mt-1 font-semibold text-gray-600">{EVENT.tagline}</p>
        </div>
      </div>

      <div className="mb-2 rounded-2xl bg-vb-brand-700 p-6 text-center text-white shadow-vb-soft animate-vb-rise">
        <h3 className="font-vb-heading text-4xl font-semibold">Registration Successful!</h3>
        <p className="text-lg opacity-90">Welcome to {event?.title || EVENT.title}</p>
      </div>
      <div className="mb-4 rounded-2xl bg-vb-brand-900 py-2">
        <Figure name="lotus" label="A blooming lotus" className="h-[200px]" />
      </div>

      {candidate && (
        <div className="mb-5 rounded-xl border border-black/10 bg-white p-4 shadow-md">
          <p className="text-lg font-bold text-vb-brand-700">Thank you, {candidate.name}!</p>
          <p className="text-sm text-gray-600">We&apos;ve received your payment of {candidate.paymentAmount ? formatINR(candidate.paymentAmount) : "N/A"}</p>
          <p className="text-sm text-gray-600">Payment ID: {candidate.paymentId || paymentId}</p>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-lg md:p-6">
        <h3 className="text-center font-vb-heading text-2xl font-semibold text-vb-brand-700">Your Registration is Confirmed!</h3>
        {event && <InfoRow icon={CalendarDays} title="Event Date">{event.dateLabel}</InfoRow>}
        {event && <InfoRow icon={MapPin} title="Venue">{[event.venue.name, event.venue.address].filter(Boolean).join(", ")}</InfoRow>}
        {isStudent ? (
          <InfoRow icon={IdCard} title="Bring your student ID">
            Please carry your student ID card to the event. Our team will verify it and send your QR on WhatsApp once approved.
          </InfoRow>
        ) : (
          <InfoRow icon={QrCode} title="At the gate">Show your QR code at the gate for a quick scan.</InfoRow>
        )}
        <InfoRow icon={Phone} title="WhatsApp Updates">You&apos;ll receive event updates and group links on WhatsApp</InfoRow>
        <div className="rounded-lg bg-vb-brand-50 p-3">
          <p className="font-semibold text-vb-brand-700">Highlights</p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-center text-sm md:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <p key={h.id} className="font-semibold">{h.title}</p>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {!isStudent && (
            <Link href={`${BASE_PATH}/attendance`} className={vbButtonClass("festival", "md")}>
              <QrCode size={18} /> View my QR code
            </Link>
          )}
          {event && (
            <VbButton onClick={() => downloadEventIcs(event)} leftIcon={<CalendarPlus size={18} />} variant="outline">
              Add to calendar
            </VbButton>
          )}
          {event && (
            <a href={event.venue.mapsUrl} target="_blank" rel="noopener noreferrer" className={vbButtonClass("outline", "md")}>
              <Navigation size={18} /> Get directions
            </a>
          )}
          <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer" className={vbButtonClass("outline", "md", "border-green-300 text-green-700 hover:bg-green-50")}>
            <MessageCircle size={18} /> Invite a friend
          </a>
        </div>
        <div className="rounded-lg bg-black/5 p-4 text-center">
          <p className="mb-2 text-sm font-semibold">Need Help?</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href={`mailto:${EVENT.contact.email}`} className="flex items-center gap-1 text-vb-brand-600">
              <Mail className="h-4 w-4" /> Email Support
            </a>
            <a href={`tel:${EVENT.contact.phone}`} className="flex items-center gap-1 text-vb-brand-600">
              <Phone className="h-4 w-4" /> Call Us
            </a>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <VbButton onClick={() => router.push(BASE_PATH)} variant="ghost" leftIcon={<ArrowLeft size={18} />}>
          Register Another Participant
        </VbButton>
      </div>
      <div className="mt-6 rounded-xl bg-vb-brand-700 p-4 text-center text-white">
        <p className="mb-1 font-semibold">🙏 Hare Krishna! 🙏</p>
        <p className="text-sm opacity-90">We&apos;re excited for a day with nature &amp; divine!</p>
      </div>
    </div>
  );
}

export default function ThankYou() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { status, candidate } = usePaymentStatus(id);
  const home = () => router.push(BASE_PATH);

  let content: ReactNode;
  if (status === "loading") {
    content = (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Checking payment">
        <Spinner className="h-14 w-14" />
      </div>
    );
  } else if (status === "pending") {
    content = (
      <StatusCard tone="text-orange-500" title="Payment Processing" icon={<Spinner className="h-14 w-14 text-orange-500" />}>
        <p>Your payment is being processed. This usually takes 10-20 seconds.</p>
        <p className="text-sm text-gray-600">Payment ID: {id}</p>
        <p className="text-sm text-gray-600">Please wait... We&apos;re automatically checking your payment status.</p>
        <VbButton variant="ghost" onClick={home}>Register Another Person</VbButton>
        <p className="text-xs text-gray-600">Need help? Contact support with your payment ID above.</p>
      </StatusCard>
    );
  } else if (status === "failed") {
    content = (
      <StatusCard tone="text-red-500" title="Payment Failed" icon={<XCircle className="h-16 w-16 text-red-400" />}>
        <p>Your payment was not successful. This could be due to payment cancellation, insufficient funds, or a technical issue.</p>
        {candidate?.paymentFailureReason && <p className="rounded-md bg-black/5 p-3 text-sm">Reason: {candidate.paymentFailureReason}</p>}
        <p className="text-sm text-gray-600">Payment ID: {id}</p>
        <VbButton variant="festival" onClick={home}>Try Registration Again</VbButton>
        <a href={`mailto:${EVENT.contact.email}`} className={vbButtonClass("outline", "md")}>Contact Support</a>
      </StatusCard>
    );
  } else if (status === "invalid" || status === "error") {
    const invalid = status === "invalid";
    content = (
      <StatusCard tone={invalid ? "text-red-500" : "text-orange-500"} title={invalid ? "Invalid Payment" : "Server Error"}>
        <p>
          {invalid
            ? "This payment ID is not valid or doesn't match any registration."
            : "Something went wrong while verifying your payment. Please try again later."}
        </p>
        <VbButton variant="festival" onClick={home}>Go Back to Home</VbButton>
      </StatusCard>
    );
  } else {
    content = <SuccessView candidate={candidate} paymentId={id} />;
  }

  return <PublicShell>{content}</PublicShell>;
}
