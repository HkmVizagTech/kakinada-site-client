"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, CheckCircle2, History, TriangleAlert, XCircle } from "lucide-react";
import { ordinalYear } from "@/lib/vanabhojanam/format";
import { PageHeader } from "../AdminKit";
import { VbAlert, VbBadge, Spinner } from "../../ui/Feedback";
import { VbSelect } from "../../ui/Fields";
import { useAttendanceScan, type ScanResult } from "./useAttendanceScan";
import { useQrScanner } from "./useQrScanner";

const TONES = {
  success: { color: "green", alert: "success", icon: CheckCircle2, ring: "#38a169" },
  warning: { color: "orange", alert: "warning", icon: TriangleAlert, ring: "#dd6b20" },
  error: { color: "red", alert: "error", icon: XCircle, ring: "#e53e3e" },
} as const;
type Tone = keyof typeof TONES;
const toneOf = (result: ScanResult | null): Tone | null => (!result ? null : result.status === "error" ? "error" : result.status === "already-marked" ? "warning" : "success");

function Corners({ color }: { color: string }) {
  const base = "absolute h-9 w-9 transition-[border-color] duration-200";
  const style = { borderColor: color, borderStyle: "solid" } as const;
  return (
    <>
      <div className={`${base} left-3 top-3 rounded-tl-xl`} style={{ ...style, borderWidth: "4px 0 0 4px" }} />
      <div className={`${base} right-3 top-3 rounded-tr-xl`} style={{ ...style, borderWidth: "4px 4px 0 0" }} />
      <div className={`${base} bottom-3 left-3 rounded-bl-xl`} style={{ ...style, borderWidth: "0 0 4px 4px" }} />
      <div className={`${base} bottom-3 right-3 rounded-br-xl`} style={{ ...style, borderWidth: "0 4px 4px 0" }} />
    </>
  );
}

function MemberCard({ member }: { member: any }) {
  const again = member.wasAlreadyScanned;
  return (
    <div className={`rounded-lg border p-3 ${again ? "border-yellow-300 bg-yellow-50" : "border-green-200 bg-green-50"}`}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <p className="font-bold">{member.name}</p>
        <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white ${again ? "bg-yellow-500" : "bg-green-600"}`}>
          {again ? "ALREADY SCANNED" : "NEW SCAN"}
        </span>
      </div>
      {member.email && <p className="text-sm"><b>Email:</b> {member.email}</p>}
      {member.gender && <p className="text-sm"><b>Gender:</b> {member.gender}</p>}
      {member.college && <p className="text-sm"><b>College/Company:</b> {member.college}</p>}
      {member.course && member.year && <p className="text-sm"><b>Course:</b> {member.course} - {ordinalYear(member.year)}</p>}
    </div>
  );
}

function ResultPanel({ result }: { result: ScanResult }) {
  const tone = TONES[toneOf(result) as Tone];
  return (
    <motion.div key={result.at.getTime()} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className="flex w-full flex-col gap-3">
      <VbAlert status={tone.alert} title={result.message || (result.status === "error" ? "Scan failed" : "Scanned")}>
        {result.scannedBy && <span className="text-sm">QR Code scanned by: <b>{result.scannedBy}</b></span>}
      </VbAlert>
      {result.members.length > 0 && (
        <div>
          <p className="mb-2 font-bold text-vb-brand-700">
            {result.total === 1 ? "Registration Details:" : `Family Registration (${result.total} members):`}
          </p>
          <div className="flex flex-col gap-2">
            {result.members.map((m, i) => <MemberCard key={m.id || m._id || i} member={m} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const { result, history, handleDecode } = useAttendanceScan();
  const { devices, ready, error } = useQrScanner({ videoRef, onDecode: handleDecode, deviceId });
  const tone = toneOf(result);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Admin QR Scanner" subtitle="Hold a registration QR up to the camera" />
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/10 bg-white p-3 shadow-lg md:p-5">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-black transition-[outline-color] duration-200"
          style={{ outline: "4px solid", outlineColor: tone ? TONES[tone].ring : "transparent" }}
        >
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          <Corners color={tone ? TONES[tone].ring : "#ffffff"} />
          {ready && !reduced && (
            <motion.div
              className="absolute left-[8%] right-[8%] h-[3px] rounded-full bg-vb-brass-300"
              style={{ boxShadow: "0 0 14px 2px rgba(246,171,46,0.9)" }}
              initial={{ top: "8%" }}
              animate={{ top: "90%" }}
              transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
          )}
          {!ready && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
              <Spinner className="h-8 w-8 text-white" /> <p className="text-sm">Starting camera...</p>
            </div>
          )}
        </div>

        {devices.length > 1 && (
          <div className="flex w-full items-center gap-2">
            <Camera size={18} />
            <VbSelect inputSize="sm" aria-label="Camera" value={deviceId ?? ""} onChange={(e) => setDeviceId(e.target.value || null)}>
              <option value="">Default camera</option>
              {devices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${i + 1}`}</option>
              ))}
            </VbSelect>
          </div>
        )}

        {error && <VbAlert status="error" className="w-full">{error}</VbAlert>}

        {result ? <ResultPanel result={result} /> : ready && <p className="text-sm text-gray-600">Waiting for a QR code...</p>}
      </div>

      {history.length > 0 && (
        <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
          <div className="mb-2 flex items-center gap-2"><History size={16} /><p className="font-bold">This session</p></div>
          <div className="flex flex-col gap-1">
            {history.map((h) => (
              <div key={`${h.token}-${h.at.getTime()}`} className="flex items-center justify-between gap-2 text-sm">
                <p className="truncate">{h.members.map((m) => m.name).join(", ") || h.message}</p>
                <div className="flex shrink-0 items-center gap-2">
                  <VbBadge color={TONES[toneOf(h) as Tone].color}>{h.status === "error" ? "Error" : h.status === "already-marked" ? "Repeat" : "OK"}</VbBadge>
                  <span className="text-xs text-gray-600">{h.at.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
