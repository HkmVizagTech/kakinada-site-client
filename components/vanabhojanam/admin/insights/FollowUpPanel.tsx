"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Send } from "lucide-react";
import { eventsApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { useAsyncData, usePagination, vbToast } from "@/lib/vanabhojanam/hooks";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { VbButton } from "../../ui/Button";
import { VbSelect } from "../../ui/Fields";
import { ErrorNotice, VbAlert } from "../../ui/Feedback";
import { DataTable, Pagination, type Column } from "../AdminKit";
import { exportToExcel } from "./exportExcel";

const AUDIENCES = [
  { value: "attended", label: "Came to that event", hint: "Scanned at the gate" },
  { value: "registered", label: "Everyone who paid", hint: "Whether or not they came" },
  { value: "no_show", label: "Paid but did not come", hint: "Registered, no scan" },
];
const PAGE_SIZE = 25;
const tenDigits = (phone: unknown) => String(phone).replace(/^91/, "");

const columns: Column[] = [
  { key: "idx", header: "#", render: (_, i) => i + 1 },
  { key: "name", header: "Name", wrap: true, minW: "160px", render: (p) => <span className="font-semibold">{p.names.join(", ")}</span> },
  { key: "phone", header: "WhatsApp", render: (p) => tenDigits(p.phone) },
  { key: "college", header: "College / company", wrap: true, minW: "180px", render: (p) => p.college || "-" },
  { key: "type", header: "Type", render: (p) => (p.type === "College" ? "Student" : p.type === "Working" ? "Other" : "-") },
  { key: "attended", header: "Came", render: (p) => (p.attended ? "Yes" : "No") },
];

const EMPTY = { total: 0, alreadyRegistered: 0, people: [] as any[] };

/** "Who should we invite back?": people from one edition who have not registered for another yet. */
export default function FollowUpPanel({ events }: { events: any[] }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const sorted = useMemo(() => [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [events]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [audience, setAudience] = useState("attended");
  const [sending, setSending] = useState(false);

  // Sensible defaults: invite last year's people to the newest event.
  useEffect(() => {
    if (!sorted.length || from || to) return;
    setTo((sorted.find((e) => e.isCurrent) || sorted[0])._id);
    setFrom((sorted.find((e) => !e.isCurrent) || sorted[sorted.length - 1])._id);
  }, [sorted, from, to]);

  const ready = Boolean(from && to && from !== to);
  const { data: result, loading, error, reload } = useAsyncData<typeof EMPTY>(
    (signal) => (ready ? eventsApi.followup({ from, to, audience }, signal) : Promise.resolve(EMPTY)),
    EMPTY,
    [from, to, audience, ready]
  );
  const data = result || EMPTY;
  const { page, setPage, pageCount, pageItems, offset } = usePagination(data.people, PAGE_SIZE);
  const nameOf = (id: string) => sorted.find((e) => e._id === id)?.name || "";

  const exportList = () =>
    exportToExcel({
      rows: data.people.map((p, i) => ({
        "S.No": i + 1,
        Name: p.names.join(", "),
        WhatsApp: tenDigits(p.phone),
        "College/Company": p.college,
        Type: p.type === "College" ? "Student" : "Other",
        Email: p.email,
        [`Came to ${nameOf(from)}`]: p.attended ? "Yes" : "No",
      })),
      sheetName: "Follow up",
      fileName: `follow-up-${nameOf(from)}-to-${nameOf(to)}.xlsx`.replace(/\s+/g, "-"),
    });

  const send = async () => {
    setSending(true);
    try {
      const res = await eventsApi.sendFollowup({ from, to, audience });
      vbToast({ title: `Sent ${res.sent} of ${res.total} invitations`, status: res.sent ? "success" : "warning", duration: 6000 });
      setConfirmOpen(false);
    } catch (err) {
      vbToast({ title: "Could not send invitations", description: getErrorMessage(err), status: "error", duration: 8000 });
    } finally {
      setSending(false);
    }
  };

  const labelCls = "mb-1.5 block text-sm font-semibold text-vb-brand-700";

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-6">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="fu-from" className={labelCls}>Invite people from</label>
          <VbSelect id="fu-from" value={from} onChange={(e) => setFrom(e.target.value)}>
            {sorted.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </VbSelect>
        </div>
        <div>
          <label htmlFor="fu-to" className={labelCls}>to</label>
          <VbSelect id="fu-to" value={to} onChange={(e) => setTo(e.target.value)}>
            {sorted.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </VbSelect>
        </div>
      </div>

      <div role="radiogroup" className="mb-4 flex flex-col gap-2 md:flex-row md:gap-6">
        {AUDIENCES.map((a) => (
          <label key={a.value} className="flex cursor-pointer items-start gap-2">
            <input type="radio" name="fu-audience" value={a.value} checked={audience === a.value} onChange={() => setAudience(a.value)} className="mt-1 h-4 w-4 accent-[#20603d]" />
            <span>
              <span className="block font-semibold leading-tight">{a.label}</span>
              <span className="block text-xs text-gray-600">{a.hint}</span>
            </span>
          </label>
        ))}
      </div>

      {!ready ? (
        <VbAlert status="info">Choose two different events to see who to follow up with.</VbAlert>
      ) : (
        <>
          <ErrorNotice error={error} onRetry={reload} />
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p>
              <b>{data.people.length}</b> {data.people.length === 1 ? "person" : "people"} to invite
              {data.alreadyRegistered > 0 && <span className="text-gray-600"> ({data.alreadyRegistered} already registered for {nameOf(to)})</span>}
            </p>
            <div className="flex gap-2">
              <VbButton size="sm" variant="outline" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={exportList} disabled={!data.people.length}>
                Export to Excel
              </VbButton>
              <VbButton size="sm" leftIcon={<Send className="h-3.5 w-3.5" />} onClick={() => setConfirmOpen(true)} disabled={!data.people.length}>
                Send WhatsApp invitation
              </VbButton>
            </div>
          </div>
          <DataTable columns={columns} rows={pageItems} rowKey="phone" offset={offset} emptyText={loading ? "Loading..." : "Nobody to follow up with for this selection."} />
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={data.people.length} offset={offset} pageSize={PAGE_SIZE} />
        </>
      )}

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={send} confirmLabel="Send invitations" tone="success" title="Send WhatsApp invitations" isLoading={sending}>
        This sends the approved invitation template to <strong>{data.people.length}</strong> people, inviting them to <strong>{nameOf(to)}</strong>.
        <p className="mt-2 text-sm text-gray-600">Each person receives one message. This cannot be undone.</p>
      </ConfirmDialog>
    </div>
  );
}
