"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { eventSchema } from "@/lib/eventSchema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEvents, addEvent, updateEvent, deleteEvent, Event as EventType } from "@/store/eventsSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, CalendarDays, MapPin, Clock, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/image-upload";
import { useAdminLoader } from "@/contexts/AdminLoaderContext";
import FormBuilder, { FieldDef } from "@/components/admin/FormBuilder";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import { toast } from "@/hooks/use-toast";


export default function AdminEvents() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state: any) => state.events.events as EventType[]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{ title: string; date: string; time: string; location: string; status: string; image: string; images?: string[]; file?: File }>({ title: "", date: "", time: "", location: "", status: "upcoming", image: "" });
    const [registrationForm, setRegistrationForm] = useState<any>(null);
    const [showFormBuilder, setShowFormBuilder] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: { title: "", date: "", time: "", location: "", status: "upcoming", category: "" }
  });
  const fileRef = useRef<File | null>(null);

  const openCreate = () => {
    setForm({ title: "", date: "", time: "", location: "", status: "upcoming", image: "" });
  setRegistrationForm(null);
  reset({ title: "", date: "", time: "", location: "", status: "upcoming", category: "" });
    fileRef.current = null;
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (event: EventType) => {
  setForm({ title: event.title, date: event.date, time: event.time, location: event.location, status: event.status, image: event.image || (event.images && event.images[0]) || "", images: event.images });
  setRegistrationForm((event as any).registrationForm || null);
  reset({ title: event.title, date: event.date, time: event.time, location: event.location, status: event.status as any, category: (event as any).category || "" });
    fileRef.current = null;
    setEditing(event.id);
    setShowForm(true);
  };

  const [activeEventForForm, setActiveEventForForm] = useState<number | null>(null);
  const router = useRouter();
  const { show, hide } = useAdminLoader();

  const saveRegistrationForm = async (eventId: string | number, formSchema: any) => {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3000";
    let success = false;
  try {
  setSubmitting(true);
  show && show('Saving registration form...');
    console.log('saveRegistrationForm: sending', eventId, formSchema);
    // fetch existing event to include required fields (validator expects them)
    let title = '';
    let description = '';
    let date = '';
    try {
      const evRes = await authFetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });
      if (evRes.ok) {
        const evJson = await evRes.json().catch(()=>null);
        const ev = evJson?.event || evJson;
        if (ev) {
          title = ev.title || '';
          description = ev.description || '';
          date = ev.date ? new Date(ev.date).toISOString() : '';
        }
      }
    } catch (_) {}

    const fd = new FormData();
    fd.append("registrationForm", JSON.stringify(formSchema));
    // include required fields so server validation passes
    if (title) fd.append('title', title);
    if (description) fd.append('description', description);
    if (date) fd.append('date', date);

    const res = await authFetch(`${apiUrl}/events/${eventId}`, { method: "PUT", body: fd, credentials: "include" });
    if (res.ok) {
        console.log('saveRegistrationForm: response ok for', eventId);
        try {
          const json = await res.json();
          if (json) {
            const ev = json.event || json;
            const updated = { ...ev, id: ev._id || ev.id || `tmp-${eventId}` };
            dispatch(updateEvent(updated as any));
            // ensure local registrationForm state matches saved value
            try { setRegistrationForm((updated as any).registrationForm || null); } catch (_) {}
            // fetch the event to confirm persistence
            try {
              const check = await authFetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });
              if (check.ok) {
                const j = await check.json().catch(()=>null);
                console.log('saveRegistrationForm: fetched after save', j?.event || j);
              }
            } catch (_) {}
            toast({ title: 'Form saved', description: 'Registration form saved for this event' });
          }
        } catch (_) {}
        // revalidate the public page for this event
        try { authFetch(`/api/revalidate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path: `/events/${eventId}` }) }).catch(()=>null); } catch (_) {}
    } else {
      const txt = await res.text().catch(()=>null);
      toast({ title: 'Failed to save form', description: txt || res.statusText });
    }
    } catch (err) {
      console.error('saveRegistrationForm err', err);
      toast({ title: 'Failed', description: 'Error saving registration form' });
    } finally {
      setSubmitting(false);
      hide && hide();
    }
    setShowForm(false);
  console.log('saveRegistrationForm: finished for', eventId);
  };

  const handleDelete = async (id: number) => {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3003";
    try {
      const res = await authFetch(`${apiUrl}/events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        dispatch(deleteEvent(id));
      }
    } catch (err) {
    }
  };

  const statusColor = (s: string): "default" | "secondary" | "outline" => {
    if (s === "upcoming") return "default";
    if (s === "recurring") return "secondary";
    return "outline";
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3003";
      try {
  const res = await authFetch(`${apiUrl}/events`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.events)) {
          dispatch(setEvents(data.events.map((e: any, i: number) => ({ ...e, id: e._id || e.id || `temp-${Date.now()}-${i}` }))));
        }
      } catch {}
    };
    fetchEvents();
  }, [dispatch]);

  async function onSubmit(data: any) {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3003";
    let success = false;
  try {
  setSubmitting(true);
  show && show(editing ? 'Updating event...' : 'Creating event...');
    const fd = new FormData();
      for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) fd.append(key, String(data[key]));
      }
  if (fileRef.current) fd.append("images", fileRef.current);
  if (editing) {
        // If admin has a registration form open/set, include it in the update payload
        if (registrationForm) {
          try {
            fd.append("registrationForm", JSON.stringify(registrationForm));
          } catch (_) {}
        }
        const res = await authFetch(`${apiUrl}/events/${editing}`, { method: "PUT", body: fd, credentials: "include" });
          if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json) {
            const ev = (json && json.event) ? json.event : json;
            const normalized = { ...ev, id: ev._id || ev.id || `temp-${Date.now()}` } as any;
            dispatch(updateEvent(normalized));
            // revalidate updated event page
            try { authFetch(`/api/revalidate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path: `/events/${normalized._id || normalized.id}` }) }).catch(()=>null); } catch (_) {}
          }
          success = true;
        } else {
          const txt = await res.text().catch(()=>null);
          toast({ title: 'Failed to update event', description: txt || res.statusText });
        }
  } else {
  show && show('Creating event...');
        // If admin built a registration form while creating the event, include it so the server stores it
        if (registrationForm) {
          try {
            fd.append("registrationForm", JSON.stringify(registrationForm));
          } catch (_) {}
        }
        const res = await authFetch(`${apiUrl}/events`, { method: "POST", body: fd, credentials: "include" });
  if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json) {
            const ev = (json && json.event) ? json.event : json;
            const normalized = { ...ev, id: ev._id || ev.id || `temp-${Date.now()}` } as any;
            dispatch(addEvent(normalized));
            // revalidate created event page
            try { authFetch(`/api/revalidate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path: `/events/${normalized._id || normalized.id}` }) }).catch(()=>null); } catch (_) {}
          }
          success = true;
        } else {
          const txt = await res.text().catch(()=>null);
          toast({ title: 'Failed to create event', description: txt || res.statusText });
        }
      }
    } catch (err) {
      toast({ title: 'Network error', description: 'Network error while creating/updating event' });
    } finally {
      setSubmitting(false);
      try { hide && hide(); } catch (_) {}
    }
    if (success) {
      setShowForm(false);
      reset();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage temple events and festivals</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Event</Button>
      </div>

      {
}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-background rounded-2xl p-6 w-full max-w-lg shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-xl font-bold">
                  {editing ? "Edit Event" : "Create Event"}
                </h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <ImageUpload
                  value={form.image}
                  onChange={(url, file) => {
                    setForm({ ...form, image: url });
                    if (file) fileRef.current = file;
                  }}
                />
                  <div className="flex items-center justify-between">
                    <div />
                    <div>
                      <Button variant="outline" size="sm" onClick={() => { setShowFormBuilder(true); setActiveEventForForm(editing); }}>Edit registration form</Button>
                    </div>
                  </div>
                <Input placeholder="Event Title" {...register("title")}/>
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message as string}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <Input type="date" {...register("date")}/>
                  <Input type="time" {...register("time")}/>
                </div>
                {errors.date && <p className="text-destructive text-xs mt-1">{errors.date.message as string}</p>}
                <Input placeholder="Location" {...register("location")}/>
                <Textarea placeholder="Description" {...register("description")} rows={3} />
                {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message as string}</p>}
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("status")}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="recurring">Recurring</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" onClick={handleSubmit(onSubmit)} disabled={submitting}>
                    {submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update Event' : 'Create Event')}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {
}
      <AnimatePresence>
        {showFormBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
            onClick={() => setShowFormBuilder(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-background rounded-2xl p-6 w-full max-w-4xl overflow-auto shadow-elevated"
              style={{ maxHeight: 'calc(95vh + 1cm)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormBuilder
                value={registrationForm}
                onChange={(v) => setRegistrationForm(v)}
                onClose={() => { setShowFormBuilder(false); setActiveEventForForm(null); }}
                onSave={(v) => {
                  if (activeEventForForm) saveRegistrationForm(activeEventForForm, v);
                  setShowFormBuilder(false);
                  setActiveEventForForm(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {
}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {!events.length && (
              <div className="text-center text-muted-foreground py-10 col-span-full">No events found.</div>
            )}

            {events.map((eventItem, idx) => {
              const ev = (eventItem && (eventItem as any).event) ? (eventItem as any).event : (eventItem as any);
              const id = ev._id || ev.id || `tmp-${idx}-${Date.now()}`;
              const image = ev.image || (ev.images && ev.images[0]) || '';
              const display = { ...ev, id, image } as any;

              return (
                <div key={id} className="bg-card rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-4">
                    <EventCard event={display} href={`/events/${id}`} smallCard />
                  </div>

                  {
}
                  <div className="px-4 pb-4 pt-2 flex items-center justify-center gap-2 border-t border-border bg-background">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(display)}
                      aria-label="Edit"
                      className="text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveEventForForm(id);
                        setRegistrationForm((display as any).registrationForm || null);
                        setShowFormBuilder(true);
                      }}
                      className="border-primary text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors"
                    >
                      Form
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/events/registrations?eventId=${String(id)}`)}
                      className="border-primary text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors"
                    >
                      Registrations
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const cols = ["title", "date", "time", "location", "description", "category"];
                        const rows = [cols.map((c) => JSON.stringify((display as any)[c] ?? "")).join(",")];
                        const csv = [cols.join(","), ...rows].join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `event-${id}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      aria-label="Export CSV"
                      className="text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(id)}
                      aria-label="Delete"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
