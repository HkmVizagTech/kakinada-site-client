"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Clock, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { attendanceApi } from "@/lib/vanabhojanam/api";
import { EVENT } from "@/lib/vanabhojanam/config";
import { formatDateTime, onlyDigits, ordinalYear } from "@/lib/vanabhojanam/format";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { cn } from "@/lib/utils";
import { VbButton } from "../ui/Button";
import { FormField, VbInput, VbInputGroup } from "../ui/Fields";
import { VbAlert, VbBadge } from "../ui/Feedback";
import PublicShell from "../ui/PublicShell";
import Figure from "./Figure";

const NOT_FOUND_HINTS = ["not found", "not registered", "no user"];
const initial = { loading: false, fieldError: "", notFound: false, error: "", candidates: [] as any[], total: 0 };

/** Looks up every registration (and its attendance QR) tied to a WhatsApp number. */
function useQrLookup() {
  const [state, setState] = useState(initial);

  const lookup = useCallback(async (rawPhone: string) => {
    const phone = onlyDigits(rawPhone.trim());
    if (!/^\d{10}$/.test(phone)) {
      setState({ ...initial, fieldError: "Please enter a valid 10-digit phone number." });
      return false;
    }
    setState({ ...initial, loading: true });
    try {
      const data = await attendanceApi.getQrCodes(phone);
      if (data.candidates?.length) {
        setState({ ...initial, candidates: data.candidates, total: data.totalCandidates || data.candidates.length });
        return true;
      }
      setState({ ...initial, error: "No QR codes found for this number" });
    } catch (err: any) {
      const message = (err.response?.data?.message || "").toLowerCase();
      if (NOT_FOUND_HINTS.some((hint) => message.includes(hint))) setState({ ...initial, notFound: true });
      else setState({ ...initial, error: getErrorMessage(err, "Could not fetch QR codes") });
    }
    return false;
  }, []);

  return { ...state, lookup };
}

function QrCard({ candidate }: { candidate: any }) {
  const attendedAt = candidate.adminAttendanceDate || candidate.attendanceDate;
  const attended = candidate.isAttended;
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-2xl border-2 p-4", attended ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50")}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <p className="text-lg font-bold text-vb-brand-700">{candidate.name}</p>
        <VbBadge color={attended ? "green" : "orange"}>{attended ? "✅ Attended" : "⏳ Not Attended"}</VbBadge>
      </div>
      {candidate.college && <p className="text-sm text-gray-600">{candidate.college}</p>}
      {candidate.course && candidate.year && (
        <p className="text-sm text-gray-600">
          {candidate.course} - {ordinalYear(candidate.year)}
        </p>
      )}
      <div className="rounded-lg bg-white p-3 shadow-sm">
        <QRCodeSVG value={candidate.attendanceToken} size={168} />
      </div>
      {attendedAt && <p className="text-xs text-gray-600">Attended: {formatDateTime(attendedAt)}</p>}
      {!attended && <p className="text-xs font-bold text-orange-600">📱 Show this QR to admin for attendance</p>}
    </div>
  );
}

/** "View QR Codes": public page for participants, also used (embedded) inside the admin console. */
export default function QrLookup({ embedded = false }: { embedded?: boolean }) {
  const [phone, setPhone] = useState("");
  const { loading, fieldError, notFound, error, candidates, total, lookup } = useQrLookup();

  const attended = useMemo(() => candidates.filter((c) => c.isAttended).length, [candidates]);
  const pending = total - attended;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await lookup(phone)) setPhone("");
  };

  const body = (
    <div className={cn("mx-auto w-full px-4 py-6 md:py-12", candidates.length > 1 ? "max-w-2xl" : "max-w-md")}>
      <div className="rounded-3xl border border-black/10 bg-white p-5 text-center shadow-xl md:p-8">
        {!embedded && (
          <div className="-mt-2 mb-2 rounded-2xl bg-vb-brand-900">
            <Figure name="lotus" label="A blooming lotus" className="h-[150px]" />
          </div>
        )}
        <h1 className="font-vb-heading text-4xl font-semibold text-vb-brand-700">{embedded ? "QR lookup" : "View QR Codes"}</h1>
        <p className="mb-6 mt-1 text-gray-600">
          {embedded ? "Enter a participant's WhatsApp number to see their entry QR." : "Enter your WhatsApp mobile number to view all your QR codes for attendance."}
        </p>

        <form onSubmit={submit} noValidate>
          <FormField id="phone" label="WhatsApp Number" error={fieldError} className="text-left">
            <VbInputGroup prefix="+91">
              <VbInput
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(onlyDigits(e.target.value).slice(0, 10))}
                maxLength={10}
                autoComplete="tel-national"
                className="font-medium tracking-wide"
                disabled={loading}
                invalid={!!fieldError}
              />
            </VbInputGroup>
          </FormField>
          <VbButton type="submit" variant="festival" size="lg" className="mt-5 h-12 w-full" loading={loading} loadingText="Loading..." disabled={phone.length !== 10}>
            View QR Codes
          </VbButton>
        </form>

        {notFound && (
          <VbAlert status="warning" title="Number not registered!" className="mt-6 text-left">
            Please register here:{" "}
            <a href={EVENT.registrationUrl} className="font-bold underline">
              {EVENT.registrationUrl}
            </a>
            <br />
            And please visit the enquiry counter.
          </VbAlert>
        )}

        {error && (
          <VbAlert status="error" title="Error" className="mt-6 text-left">
            {error}
          </VbAlert>
        )}

        {candidates.length > 0 && (
          <div className="mt-8">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
            <p className="mt-3 text-xl font-bold text-vb-brand-700">
              Found {total} registration{total > 1 ? "s" : ""} for this number
            </p>
            <p className="mt-2 flex items-center justify-center gap-2 text-vb-brand-600">
              <QrCode size={18} /> QR Code{total > 1 ? "s" : ""} for Attendance
            </p>

            <div className={cn("mt-5 grid grid-cols-1 gap-5", total > 2 && "md:grid-cols-2")}>
              {candidates.map((c, i) => (
                <QrCard key={c.id || i} candidate={c} />
              ))}
            </div>

            <div className="mt-6">
              <p className="font-bold text-vb-brand-600">Show {total > 1 ? "individual QR codes" : "this QR code"} to admin for attendance.</p>
              {total > 1 && <p className="mt-1 text-sm text-gray-600">Each person must scan their own QR code individually.</p>}
              <div className="mt-3 flex justify-center gap-4">
                {attended > 0 && <VbBadge color="green">✅ {attended} Attended</VbBadge>}
                {pending > 0 && (
                  <VbBadge color="orange">
                    <Clock className="h-3 w-3" />
                    {pending} Pending
                  </VbBadge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return embedded ? body : <PublicShell>{body}</PublicShell>;
}
