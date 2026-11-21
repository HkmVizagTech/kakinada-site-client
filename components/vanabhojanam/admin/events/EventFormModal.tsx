"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { eventsApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { vbToast } from "@/lib/vanabhojanam/hooks";
import { toDateInput } from "@/lib/vanabhojanam/event";
import { VbButton } from "../../ui/Button";
import { FormField, VbInput, VbSelect } from "../../ui/Fields";

const blank = () => ({
  name: `Kartika Vanabhojanam ${new Date().getFullYear()}`,
  date: "",
  venueName: "",
  venueAddress: "",
  mapsUrl: "",
  audience: "both" as "both" | "students" | "working",
  feeCollege: "" as string | number,
  feeWorking: "" as string | number,
  ageMin: undefined as number | undefined,
  ageMax: undefined as number | undefined,
  registrationOpen: true,
});
type Form = ReturnType<typeof blank>;

const fromEvent = (e: any): Form => ({
  name: e.name,
  date: toDateInput(e.date),
  venueName: e.venue?.name || "",
  venueAddress: e.venue?.address || "",
  mapsUrl: e.venue?.mapsUrl || "",
  audience: (e.audience || "both") as Form["audience"],
  feeCollege: e.fees.college || "",
  feeWorking: e.fees.working || "",
  ageMin: e.ageMin,
  ageMax: e.ageMax,
  registrationOpen: e.registrationOpen,
});

// ageMin/ageMax have no field in the form; they are carried over from the event so an edit never resets them.
const toPayload = (f: Form) => ({
  name: f.name,
  date: f.date,
  venue: { name: f.venueName, address: f.venueAddress, mapsUrl: f.mapsUrl },
  audience: f.audience,
  // The fee of a group that cannot register is not needed.
  fees: { college: f.audience === "working" ? 0 : Number(f.feeCollege), working: f.audience === "students" ? 0 : Number(f.feeWorking) },
  ...(f.ageMin !== undefined ? { ageMin: f.ageMin } : {}),
  ...(f.ageMax !== undefined ? { ageMax: f.ageMax } : {}),
  registrationOpen: f.registrationOpen,
});

type TextKey = "name" | "date" | "venueName" | "venueAddress" | "mapsUrl" | "feeCollege" | "feeWorking";

/** Create or edit an edition. `event` null = create. `previous` pre-fills fees/venue from the last year. */
export default function EventFormModal({ isOpen, onClose, event, previous, onSaved }: { isOpen: boolean; onClose: () => void; event: any; previous?: any; onSaved: () => void }) {
  const [form, setForm] = useState<Form>(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    if (event) setForm(fromEvent(event));
    else {
      // New year: start from last year's venue and fees so only the date has to change.
      const base = blank();
      setForm(previous ? { ...fromEvent(previous), name: base.name, date: "", registrationOpen: true } : base);
    }
  }, [isOpen, event, previous]);

  const bind = (name: TextKey) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [name]: e.target.value })),
  });

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = toPayload(form);
      if (event) await eventsApi.update(event._id, payload);
      else await eventsApi.create(payload);
      vbToast({ title: event ? "Event updated" : "Event created", status: "success", duration: 3000 });
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the event"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle>{event ? "Edit event" : "New Vanabhojanam"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <FormField id="ev-name" label="Event name" required>
            <VbInput id="ev-name" {...bind("name")} />
          </FormField>
          <FormField id="ev-date" label="Event date" required>
            <VbInput id="ev-date" type="date" {...bind("date")} />
          </FormField>

          <FormField id="ev-audience" label="Who can register?" hint="Choose Students only or Working only to close the edition to the other group. The website, cash desk and payments all follow this.">
            <VbSelect id="ev-audience" value={form.audience} onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value as Form["audience"] }))}>
              <option value="both">Students and working professionals</option>
              <option value="students">Students only</option>
              <option value="working">Working professionals only</option>
            </VbSelect>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {form.audience !== "working" && (
              <FormField id="ev-fee-college" label="Student fee (₹)" required>
                <VbInput id="ev-fee-college" type="number" min="1" inputMode="numeric" {...bind("feeCollege")} />
              </FormField>
            )}
            {form.audience !== "students" && (
              <FormField id="ev-fee-working" label={form.audience === "working" ? "Fee (₹)" : "Fee for others (₹)"} required>
                <VbInput id="ev-fee-working" type="number" min="1" inputMode="numeric" {...bind("feeWorking")} />
              </FormField>
            )}
          </div>

          <FormField id="ev-venue" label="Venue name">
            <VbInput id="ev-venue" placeholder="ISKCON Kakinada" {...bind("venueName")} />
          </FormField>
          <FormField id="ev-address" label="Venue address">
            <VbInput id="ev-address" placeholder="Kakinada, Andhra Pradesh" {...bind("venueAddress")} />
          </FormField>
          <FormField id="ev-maps" label="Google Maps link" hint="Optional. If empty, a map search for the venue is used.">
            <VbInput id="ev-maps" placeholder="https://maps.app.goo.gl/..." {...bind("mapsUrl")} />
          </FormField>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 p-3">
            <label htmlFor="ev-open" className="text-sm font-semibold">
              Registration open
              <span className="block text-xs font-normal text-gray-600">When off, the website shows &quot;Registration is closed&quot;.</span>
            </label>
            <Switch id="ev-open" className="data-[state=checked]:bg-vb-brand-600" checked={form.registrationOpen} onCheckedChange={(v) => setForm((prev) => ({ ...prev, registrationOpen: v }))} />
          </div>

          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter className="gap-2">
          <VbButton variant="ghost" onClick={onClose}>Cancel</VbButton>
          <VbButton onClick={save} loading={saving}>{event ? "Save changes" : "Create event"}</VbButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
