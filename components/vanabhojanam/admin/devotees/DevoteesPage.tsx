"use client";

import { useMemo, useRef, useState } from "react";
import { FileUp, Trash2, UserPlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { devoteesApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { useAsyncData, vbToast } from "@/lib/vanabhojanam/hooks";
import { formatDateTimeIST } from "@/lib/vanabhojanam/format";
import { parseDevoteeList } from "@/lib/vanabhojanam/parseList";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { VbButton } from "../../ui/Button";
import { FormField, VbInput, VbInputGroup, VbTextarea } from "../../ui/Fields";
import { ErrorNotice, PageSpinner, VbAlert, VbBadge, VbCard } from "../../ui/Feedback";
import { DataTable, PageHeader, type Column } from "../AdminKit";

export default function DevoteesPage() {
  const { data: list, loading, error, reload, setData } = useAsyncData<any[]>((signal) => devoteesApi.list(signal), []);
  const data = list || [];
  const [one, setOne] = useState({ name: "", phone: "" });
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [report, setReport] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fail = (title: string, err: unknown) => vbToast({ title, description: getErrorMessage(err), status: "error", duration: 5000 });

  const addOne = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!one.name.trim() || one.phone.replace(/\D/g, "").length < 10) {
      return vbToast({ title: "Enter a name and a 10-digit WhatsApp number", status: "warning", duration: 3000 });
    }
    setBusy(true);
    try {
      const devotee = await devoteesApi.add({ name: one.name.trim(), whatsappNumber: one.phone });
      setData((prev) => [...(prev || []), devotee].sort((a, b) => a.name.localeCompare(b.name)));
      setOne({ name: "", phone: "" });
      vbToast({ title: `${devotee.name} added`, status: "success", duration: 3000 });
    } catch (err) {
      fail("Could not add", err);
    } finally {
      setBusy(false);
    }
  };

  const addMany = async () => {
    const rows = parseDevoteeList(pasted);
    if (!rows.length) return vbToast({ title: 'Paste at least one line like "Name, 9876543210"', status: "warning", duration: 3500 });
    setBusy(true);
    try {
      const result = await devoteesApi.addMany(rows);
      setReport(result);
      if (result.added) {
        setPasted("");
        reload();
      }
    } catch (err) {
      fail("Could not add the list", err);
    } finally {
      setBusy(false);
    }
  };

  const loadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setPasted(await file.text());
  };

  const toggle = async (d: any) => {
    setBusyId(d._id);
    try {
      const updated = await devoteesApi.update(d._id, { active: !d.active });
      setData((prev) => (prev || []).map((x) => (x._id === d._id ? updated : x)));
    } catch (err) {
      fail("Could not update", err);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    const target = toDelete;
    setConfirmOpen(false);
    setBusyId(target._id);
    try {
      await devoteesApi.remove(target._id);
      setData((prev) => (prev || []).filter((x) => x._id !== target._id));
      vbToast({ title: `${target.name} removed`, status: "success", duration: 3000 });
    } catch (err) {
      fail("Could not remove", err);
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column[] = useMemo(
    () => [
      { key: "name", header: "Name", render: (d) => <span className="font-semibold">{d.name}</span> },
      { key: "phone", header: "WhatsApp", render: (d) => d.whatsappNumber },
      { key: "last", header: "Last sign-in", render: (d) => (d.lastLoginAt ? formatDateTimeIST(d.lastLoginAt) : <span className="text-gray-600">Never</span>) },
      {
        key: "access",
        header: "Access",
        render: (d) => (
          <div className="flex items-center gap-2">
            <Switch className="data-[state=checked]:bg-vb-brand-600" checked={d.active} disabled={busyId === d._id} onCheckedChange={() => toggle(d)} aria-label={`${d.active ? "Switch off" : "Switch on"} ${d.name}`} />
            <VbBadge color={d.active ? "green" : "red"}>{d.active ? "Can view" : "Off"}</VbBadge>
          </div>
        ),
      },
      {
        key: "actions",
        header: "",
        render: (d) => (
          <VbButton
            variant="ghost"
            size="sm"
            className="w-9 px-0 text-red-600 hover:bg-red-50"
            aria-label={`Remove ${d.name}`}
            disabled={busyId === d._id}
            onClick={() => {
              setToDelete(d);
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </VbButton>
        ),
      },
    ],
    [busyId]
  );

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <div>
      <PageHeader title="Devotees" subtitle="People who can sign in at /devotee with a WhatsApp code and look at registrations and attendance. View only." />
      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch devotees" />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VbCard className="p-5">
          <h2 className="mb-3 text-sm font-bold">Add one devotee</h2>
          <form onSubmit={addOne} className="flex flex-col gap-3">
            <FormField id="devotee-name" label="Name" required>
              <VbInput id="devotee-name" value={one.name} onChange={(e) => setOne((p) => ({ ...p, name: e.target.value }))} placeholder="Devotee name" />
            </FormField>
            <FormField id="devotee-phone" label="WhatsApp number" required>
              <VbInputGroup prefix="+91">
                <VbInput id="devotee-phone" type="tel" inputMode="numeric" value={one.phone} onChange={(e) => setOne((p) => ({ ...p, phone: e.target.value }))} placeholder="10-digit number" />
              </VbInputGroup>
            </FormField>
            <VbButton type="submit" variant="outline" className="self-start" leftIcon={<UserPlus className="h-4 w-4" />} loading={busy}>Add devotee</VbButton>
          </form>
        </VbCard>

        <VbCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">Add a list</h2>
            <VbButton size="xs" variant="outline" leftIcon={<FileUp className="h-3.5 w-3.5" />} onClick={() => fileRef.current?.click()}>Upload CSV</VbButton>
            <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={loadFile} />
          </div>
          <VbTextarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={6} placeholder={"One per line:\nHari Das, 9876543210\nRadha Devi, 9123456780"} />
          <VbButton variant="outline" className="mt-3" onClick={addMany} loading={busy} disabled={!pasted.trim()}>Add all</VbButton>
          {report && (
            <VbAlert status={report.invalid.length ? "warning" : "success"} className="mt-3">
              Added {report.added}. {report.duplicates} already on the list.
              {report.invalid.length > 0 && <> Skipped (name or number not valid): {report.invalid.join("; ")}</>}
            </VbAlert>
          )}
        </VbCard>
      </div>

      <p className="mb-2 text-sm text-gray-600">{data.length} {data.length === 1 ? "devotee" : "devotees"}. A devotee signs in only if their number is here and their access is on.</p>
      <DataTable columns={columns} rows={data} emptyText="No devotees yet. Add one above." />

      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={remove} confirmLabel="Remove" title="Remove devotee">
        Remove <strong>{toDelete?.name}</strong>? They will be signed out and will not be able to sign in again.
      </ConfirmDialog>
    </div>
  );
}
