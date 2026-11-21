"use client";

import { useMemo, useState, useEffect } from "react";
import { BadgeIndianRupee, CheckCircle2, Send, UserPlus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cashApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { useAsyncData, vbToast } from "@/lib/vanabhojanam/hooks";
import { formatDateTime, formatINR, onlyDigits } from "@/lib/vanabhojanam/format";
import { cn } from "@/lib/utils";
import { PageSpinner, ErrorNotice, VbAlert, VbBadge } from "../../ui/Feedback";
import { VbButton } from "../../ui/Button";
import { FormField, VbInput, VbInputGroup } from "../../ui/Fields";
import { PageHeader, StatCard, DataTable, type Column } from "../AdminKit";

const empty = { name: "", whatsappNumber: "", gender: "", collegeOrWorking: "", college: "", email: "", checkIn: false };
type Form = typeof empty;

/** Only what the desk needs: name, number, gender, and student/other (which sets the fee). */
const validate = (f: Form) => {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = "Name is required";
  if (!/^\d{10}$/.test(f.whatsappNumber)) e.whatsappNumber = "Enter a valid 10-digit number";
  if (!f.gender) e.gender = "Please select gender";
  if (!f.collegeOrWorking) e.collegeOrWorking = "Choose student or other";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email";
  return e;
};

const TypeButton = ({ active, onClick, label, fee }: { active: boolean; onClick: () => void; label: string; fee?: number | null }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn("flex-1 rounded-xl border-2 p-3 text-left transition-all", active ? "border-vb-brand-500 bg-vb-brand-50" : "border-black/10 bg-white")}
  >
    <p className="font-bold">{label}</p>
    <p className="font-vb-heading text-2xl font-bold leading-[1.1] text-vb-brand-700">{fee != null ? formatINR(fee) : "-"}</p>
  </button>
);

function QrStatus({ row, onResend, busy }: { row: any; onResend: (row: any) => void; busy: boolean }) {
  const sent = row.qrSendStatus === "sent";
  return (
    <div className="flex items-center gap-2">
      <VbBadge color={sent ? "green" : "red"}>{sent ? "QR sent" : "Not sent"}</VbBadge>
      <VbButton size="xs" variant="outline" leftIcon={<Send size={12} />} loading={busy} onClick={() => onResend(row)}>
        {sent ? "Resend" : "Send QR"}
      </VbButton>
    </div>
  );
}

const initialData = { event: null as any, totals: { people: 0, amount: 0 }, registrations: [] as any[] };

export default function CashDeskPage() {
  const { data: loadedData, loading, error, reload } = useAsyncData<typeof initialData>((signal) => cashApi.list(signal), initialData);
  const data = loadedData ?? initialData;
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<any>(null); // result of the last registration
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fees = data.event?.fees;
  const feeFor = (type: string) => (type === "College" ? fees?.college : type === "Working" ? fees?.working : null);
  const audience: string = data.event?.audience || "both";
  const allowStudent = audience !== "working";
  const allowWorking = audience !== "students";
  const amount = feeFor(form.collegeOrWorking);

  // Open to one group only: pre-select it so the volunteer does not have to.
  const only = audience === "students" ? "College" : audience === "working" ? "Working" : "";
  useEffect(() => {
    if (only && form.collegeOrWorking !== only) setForm((prev) => ({ ...prev, collegeOrWorking: only }));
  }, [only, form.collegeOrWorking]);

  const set = (name: keyof Form, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const result = await cashApi.register({
        name: form.name.trim(),
        whatsappNumber: form.whatsappNumber,
        gender: form.gender,
        collegeOrWorking: form.collegeOrWorking,
        college: form.collegeOrWorking === "College" ? form.college.trim() : "",
        email: form.email.trim(),
        checkIn: form.checkIn,
      });
      setDone(result);
      setForm(empty);
      reload();
    } catch (err) {
      vbToast({ title: "Could not register", description: getErrorMessage(err), status: "error", duration: 7000 });
    } finally {
      setSaving(false);
    }
  };

  const resend = async (row: any) => {
    setResendingId(row.id);
    try {
      const result = await cashApi.sendQr(row.id);
      vbToast({
        title: result.whatsapp.ok ? "QR sent on WhatsApp" : "Could not send the QR",
        description: result.whatsapp.ok ? undefined : result.whatsapp.error,
        status: result.whatsapp.ok ? "success" : "warning",
        duration: 5000,
      });
      if (done?.candidate.id === row.id) setDone((prev: any) => ({ ...prev, whatsapp: result.whatsapp }));
      reload();
    } catch (err) {
      vbToast({ title: "Could not send the QR", description: getErrorMessage(err), status: "error", duration: 6000 });
    } finally {
      setResendingId(null);
    }
  };

  const columns: Column<any>[] = useMemo(
    () => [
      { key: "idx", header: "#", render: (_, i) => i + 1 },
      { key: "name", header: "Name", render: (r) => <span className="font-semibold">{r.name}</span> },
      { key: "phone", header: "WhatsApp", render: (r) => String(r.whatsappNumber || "").replace(/^91/, "") },
      { key: "type", header: "Type", render: (r) => (r.collegeOrWorking === "College" ? "Student" : "Other") },
      { key: "amount", header: "Cash", render: (r) => formatINR(r.paymentAmount) },
      { key: "by", header: "Taken by", render: (r) => r.collectedBy },
      { key: "time", header: "Time", render: (r) => formatDateTime(r.cashCollectedAt) },
      { key: "qr", header: "QR", render: (r) => <QrStatus row={r} onResend={resend} busy={resendingId === r.id} /> },
    ],
    [resendingId, done]
  );

  if (loading && !data.event && data.registrations.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Cash desk" subtitle={data.event ? `${data.event.name}: take cash from walk-ins and send their QR on WhatsApp` : "Take cash from walk-ins"} />
      <ErrorNotice error={error} onRetry={reload} />

      {!data.event && !loading && (
        <VbAlert status="warning" className="mb-4 rounded-xl">There is no current event yet. Ask an admin to create one under Events.</VbAlert>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="People registered" value={data.totals.people} icon={UserPlus} />
        <StatCard label="Cash collected" value={data.totals.amount} icon={BadgeIndianRupee} color="saffron" format={(n) => formatINR(n)} />
      </div>

      <div className="mb-8 grid items-start gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-6 lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold text-vb-brand-700">New walk-in</h2>
          <form onSubmit={submit} noValidate>
            <div className="flex flex-col gap-4">
              <FormField id="cash-name" label="Name" required error={errors.name}>
                <VbInput id="cash-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" autoComplete="off" />
              </FormField>
              <FormField id="cash-phone" label="WhatsApp number" required error={errors.whatsappNumber} hint="The QR pass is sent to this number">
                <VbInputGroup prefix="+91">
                  <VbInput id="cash-phone" value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", onlyDigits(e.target.value).slice(0, 10))} type="tel" inputMode="numeric" placeholder="10-digit number" autoComplete="off" />
                </VbInputGroup>
              </FormField>
              <FormField id="cash-gender" label="Gender" required error={errors.gender}>
                <div role="radiogroup" className="flex gap-6">
                  {["Male", "Female"].map((g) => (
                    <label key={g} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="radio" name="cash-gender" value={g} checked={form.gender === g} onChange={() => set("gender", g)} className="h-4 w-4 accent-[#1f6b3a]" />
                      {g}
                    </label>
                  ))}
                </div>
              </FormField>
              <FormField id="cash-type" label="Student or other?" required error={errors.collegeOrWorking}>
                <div className="flex items-stretch gap-3">
                  {allowStudent && <TypeButton active={form.collegeOrWorking === "College"} onClick={() => set("collegeOrWorking", "College")} label="College student" fee={fees?.college} />}
                  {allowWorking && <TypeButton active={form.collegeOrWorking === "Working"} onClick={() => set("collegeOrWorking", "Working")} label={audience === "working" ? "Working professional" : "Other"} fee={fees?.working} />}
                </div>
              </FormField>

              <div className="border-t border-black/10 pt-3">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">Optional</p>
                <div className="flex flex-col gap-3">
                  {form.collegeOrWorking === "College" && (
                    <FormField id="cash-college" label="College">
                      <VbInput id="cash-college" value={form.college} onChange={(e) => set("college", e.target.value)} placeholder="College name" autoComplete="off" />
                    </FormField>
                  )}
                  <FormField id="cash-email" label="Email" error={errors.email}>
                    <VbInput id="cash-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" autoComplete="off" />
                  </FormField>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input type="checkbox" checked={form.checkIn} onChange={(e) => set("checkIn", e.target.checked)} className="mt-1 h-4 w-4 accent-[#1f6b3a]" />
                    <span>
                      <span className="block font-semibold leading-tight">Also mark as arrived now</span>
                      <span className="block text-xs text-gray-600">Use when they are entering right away, so the QR need not be scanned.</span>
                    </span>
                  </label>
                </div>
              </div>

              <VbButton type="submit" variant="festival" size="lg" className="py-7" loading={saving} loadingText="Saving" disabled={!data.event} leftIcon={<BadgeIndianRupee size={20} />}>
                {amount != null ? `Cash received ${formatINR(amount)}: send QR` : "Cash received: send QR"}
              </VbButton>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          {done ? (
            <div className={cn("flex flex-col items-center gap-3 rounded-2xl border-2 bg-white p-5 text-center", done.whatsapp.ok ? "border-green-300" : "border-orange-300")}>
              <CheckCircle2 size={34} color="#38a169" />
              <h3 className="text-lg font-bold">{done.candidate.name}</h3>
              <p className="text-sm text-gray-600">{formatINR(done.amount)} received in cash{done.candidate.checkedIn ? " · marked as arrived" : ""}</p>
              <div className="rounded-lg bg-white p-3 shadow-sm"><QRCodeSVG value={done.candidate.attendanceToken} size={170} /></div>
              {done.whatsapp.ok ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                  QR sent on WhatsApp to {String(done.candidate.whatsappNumber).replace(/^91/, "")}
                </span>
              ) : (
                <>
                  <VbAlert status="warning" className="w-full text-left">Registered, but the WhatsApp could not be sent: {done.whatsapp.error}</VbAlert>
                  <VbButton size="sm" variant="soft" leftIcon={<Send size={14} />} loading={resendingId === done.candidate.id} onClick={() => resend(done.candidate)}>Try sending again</VbButton>
                  <p className="text-xs text-gray-600">They can also see their QR any time at the website&apos;s &quot;View your QR code&quot; page with their number.</p>
                </>
              )}
              <VbButton variant="outline" size="sm" onClick={() => setDone(null)}>Done</VbButton>
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl bg-black/5 p-6 text-center text-gray-600">
              <BadgeIndianRupee size={32} />
              <p className="mt-2 font-semibold">Fill in the walk-in&apos;s details</p>
              <p className="text-sm">After you take the cash, their QR pass appears here and goes to their WhatsApp.</p>
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-3 text-lg font-bold text-vb-brand-700">Cash taken so far</h2>
      <DataTable columns={columns} rows={data.registrations} rowKey="id" emptyText="No cash registrations yet." />
    </div>
  );
}
