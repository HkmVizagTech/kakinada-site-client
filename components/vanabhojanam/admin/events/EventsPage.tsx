"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { eventsApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { vbToast } from "@/lib/vanabhojanam/hooks";
import { formatEventDate } from "@/lib/vanabhojanam/event";
import { formatINR } from "@/lib/vanabhojanam/format";
import { useAdminEvent } from "../../context/AdminEventContext";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { VbButton } from "../../ui/Button";
import { PageSpinner, VbAlert, VbBadge } from "../../ui/Feedback";
import { PageHeader } from "../AdminKit";
import EventFormModal from "./EventFormModal";

const Metric = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wider text-gray-600">{label}</p>
    <p className="text-xl font-extrabold leading-[1.2]">{value}</p>
  </div>
);

function EventCard({ event, onEdit, onSetCurrent, onToggleOpen, onDelete }: { event: any; onEdit: (e: any) => void; onSetCurrent: (e: any) => void; onToggleOpen: (e: any) => void; onDelete: (e: any) => void }) {
  const { stats } = event;
  return (
    <div className={cn("rounded-2xl border-2 bg-white p-5", event.isCurrent ? "border-vb-brand-400 shadow-[0_14px_30px_-18px_rgba(32,96,61,0.7)]" : "border-black/10")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{event.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
            <span className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" />{formatEventDate(event.date)}</span>
            {event.venue?.name && <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{event.venue.name}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {event.isCurrent && <VbBadge color="green" className="rounded-full px-3">Current</VbBadge>}
          <VbBadge color={event.registrationOpen ? "blue" : "gray"} className="rounded-full px-3">
            {event.registrationOpen ? "Registration open" : "Registration closed"}
          </VbBadge>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Metric label="Paid" value={stats.paid} />
        <Metric label="Attended" value={stats.attended} />
        <Metric label="Students / others" value={`${stats.students} / ${stats.others}`} />
        <Metric label="Revenue" value={formatINR(stats.revenue)} />
        <Metric label="Fees" value={event.audience === "students" ? `${formatINR(event.fees.college)} · students only` : event.audience === "working" ? `${formatINR(event.fees.working)} · working only` : event.fees.college === event.fees.working ? formatINR(event.fees.college) : `${formatINR(event.fees.college)} / ${formatINR(event.fees.working)}`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <VbButton size="sm" variant="outline" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={() => onEdit(event)}>Edit</VbButton>
        {!event.isCurrent && (
          <VbButton size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" leftIcon={<Star className="h-3.5 w-3.5" />} onClick={() => onSetCurrent(event)}>
            Make current
          </VbButton>
        )}
        <VbButton size="sm" variant="outline" onClick={() => onToggleOpen(event)}>
          {event.registrationOpen ? "Close registration" : "Open registration"}
        </VbButton>
        {stats.registrations === 0 && (
          <VbButton size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => onDelete(event)}>Delete</VbButton>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { events, legacy, loaded, refresh, current } = useAdminEvent();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [toDelete, setToDelete] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>, success?: string) => {
    setBusy(true);
    try {
      await action();
      await refresh();
      if (success) vbToast({ title: success, status: "success", duration: 3000 });
    } catch (err) {
      vbToast({ title: "Could not complete that", description: getErrorMessage(err), status: "error", duration: 5000 });
    } finally {
      setBusy(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (event: any) => {
    setEditing(event);
    setFormOpen(true);
  };

  if (!loaded) return <PageSpinner minH="60vh" />;

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Events" subtitle="One entry for every Vanabhojanam. The current event is the one shown on the website.">
        <VbButton leftIcon={<Plus className="h-4 w-4" />} onClick={openNew}>New Vanabhojanam</VbButton>
      </PageHeader>

      {legacy > 0 && (
        <VbAlert status="info" className="mb-4 rounded-xl">
          <b>{legacy} older registrations</b> are not attached to any event, so they only appear under &quot;All events&quot;.
          {current && (
            <VbButton className="ml-2" size="xs" variant="outline" loading={busy} onClick={() => run(() => eventsApi.adoptLegacy(current._id), `Attached to ${current.name}`)}>
              Attach them to {current.name}
            </VbButton>
          )}
        </VbAlert>
      )}

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-12 text-center">
          <h2 className="text-lg font-bold">No events yet</h2>
          <p className="max-w-md text-gray-600">
            Create this year&apos;s Vanabhojanam with its date, venue and fees. It goes live on the website straight away, and registrations are collected under it.
          </p>
          <VbButton leftIcon={<Plus className="h-4 w-4" />} onClick={openNew}>Create the first event</VbButton>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={openEdit}
              onSetCurrent={(e) => run(() => eventsApi.setCurrent(e._id), `${e.name} is now the current event`)}
              onToggleOpen={(e) =>
                run(
                  () =>
                    eventsApi.update(e._id, {
                      name: e.name,
                      date: e.date,
                      venue: e.venue,
                      audience: e.audience || "both",
                      fees: e.fees,
                      ageMin: e.ageMin,
                      ageMax: e.ageMax,
                      registrationOpen: !e.registrationOpen,
                    }),
                  e.registrationOpen ? "Registration closed" : "Registration opened"
                )
              }
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <EventFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} event={editing} previous={events[0]} onSaved={refresh} />

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          await run(() => eventsApi.remove(toDelete._id), "Event deleted");
          setToDelete(null);
        }}
        confirmLabel="Delete"
        title="Delete event"
        isLoading={busy}
      >
        Delete <strong>{toDelete?.name}</strong>? Events that already have registrations cannot be deleted.
      </ConfirmDialog>
    </div>
  );
}
