"use client";

export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  Calendar,
  Search,
  Eye,
  Download,
  ChevronLeft,
  CheckCircle,
  XCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") ||
  "http://localhost:8080";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
}

interface VolunteerEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  image: string;
  slots: number;
  filledSlots: number;
  category: string;
  requirements: string;
  status: string;
  formFields: FormField[];
  createdAt: string;
}

interface Registration {
  _id: string;
  eventId: string;
  responses: Record<string, any>;
  status: string;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  { value: "festival", label: "Festival" },
  { value: "weekly", label: "Weekly" },
  { value: "special", label: "Special" },
  { value: "outreach", label: "Outreach" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "completed", label: "Completed" },
];

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
];

const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "Full Name", placeholder: "Enter your full name", required: true, options: [] },
  { id: "email", type: "email", label: "Email Address", placeholder: "Enter your email", required: true, options: [] },
  { id: "phone", type: "tel", label: "Phone Number", placeholder: "Enter your phone number", required: true, options: [] },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  closed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

let fieldCounter = 0;
function genFieldId() {
  return `field_${Date.now()}_${++fieldCounter}`;
}

export default function AdminVolunteers() {
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VolunteerEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [viewingEvent, setViewingEvent] = useState<VolunteerEvent | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regLoading, setRegLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    image: "",
    slots: 0,
    category: "festival",
    requirements: "",
    status: "active",
  });
  const [formFields, setFormFields] = useState<FormField[]>([...DEFAULT_FORM_FIELDS]);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/volunteers/admin/all`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {}
    setLoading(false);
  }

  async function fetchRegistrations(eventId: string) {
    setRegLoading(true);
    try {
      const res = await authFetch(`${API_URL}/volunteers/admin/${eventId}/registrations`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      }
    } catch {}
    setRegLoading(false);
  }

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      date: "",
      endDate: "",
      location: "",
      image: "",
      slots: 0,
      category: "festival",
      requirements: "",
      status: "active",
    });
    setFormFields([...DEFAULT_FORM_FIELDS]);
    setShowForm(true);
  };

  const openEdit = (e: VolunteerEvent) => {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description,
      date: e.date ? e.date.slice(0, 10) : "",
      endDate: e.endDate ? e.endDate.slice(0, 10) : "",
      location: e.location,
      image: e.image,
      slots: e.slots,
      category: e.category,
      requirements: e.requirements,
      status: e.status,
    });
    setFormFields(e.formFields?.length ? e.formFields : [...DEFAULT_FORM_FIELDS]);
    setShowForm(true);
  };

  // Form builder helpers
  const addField = () => {
    setFormFields([
      ...formFields,
      { id: genFieldId(), type: "text", label: "", placeholder: "", required: false, options: [] },
    ]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setFormFields(formFields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const removeField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formFields.length) return;
    const updated = [...formFields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFormFields(updated);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.date) {
      toast({ title: "Title, description, and date are required", variant: "destructive" });
      return;
    }
    const emptyLabels = formFields.some((f) => !f.label.trim());
    if (emptyLabels) {
      toast({ title: "All form fields must have a label", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        slots: Number(form.slots) || 0,
        endDate: form.endDate || undefined,
        formFields,
      };
      const url = editing
        ? `${API_URL}/volunteers/admin/${editing._id}`
        : `${API_URL}/volunteers/admin`;
      const method = editing ? "PUT" : "POST";
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (res.ok) {
        toast({ title: editing ? "Event updated" : "Event created" });
        setShowForm(false);
        fetchEvents();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this volunteer event and all its registrations?")) return;
    try {
      const res = await authFetch(`${API_URL}/volunteers/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast({ title: "Event deleted" });
        fetchEvents();
      }
    } catch {}
  };

  const handleRegStatus = async (regId: string, status: string) => {
    try {
      const res = await authFetch(`${API_URL}/volunteers/admin/registrations/${regId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (res.ok) {
        toast({ title: `Registration ${status}` });
        setRegistrations((prev) =>
          prev.map((r) => (r._id === regId ? { ...r, status } : r))
        );
      }
    } catch {}
  };

  const handleDeleteReg = async (regId: string) => {
    try {
      const res = await authFetch(`${API_URL}/volunteers/admin/registrations/${regId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast({ title: "Registration deleted" });
        setRegistrations((prev) => prev.filter((r) => r._id !== regId));
        if (viewingEvent) {
          setEvents((prev) =>
            prev.map((e) =>
              e._id === viewingEvent._id ? { ...e, filledSlots: Math.max(0, e.filledSlots - 1) } : e
            )
          );
        }
      }
    } catch {}
  };

  const exportCSV = () => {
    if (!registrations.length || !viewingEvent) return;
    const fields = viewingEvent.formFields || [];
    const cols = [...fields.map((f) => f.label), "Status", "Registered At"];
    const rows = registrations.map((r) => [
      ...fields.map((f) => {
        const val = r.responses?.[f.id];
        if (typeof val === "boolean") return val ? "Yes" : "No";
        return String(val ?? "");
      }),
      r.status,
      new Date(r.createdAt).toLocaleString("en-IN"),
    ]);
    const csv = [cols.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `volunteers-${viewingEvent.title.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const filtered = events.filter((e) =>
    search ? e.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  const totalRegs = events.reduce((sum, e) => sum + e.filledSlots, 0);
  const activeCount = events.filter((e) => e.status === "active").length;

  // Registrations view
  if (viewingEvent) {
    const fields = viewingEvent.formFields || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setViewingEvent(null);
              setRegistrations([]);
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold">{viewingEvent.title}</h1>
            <p className="text-sm text-muted-foreground">
              {registrations.length} registration{registrations.length !== 1 ? "s" : ""}
              {fields.length > 0 && ` · ${fields.length} form fields`}
            </p>
          </div>
          {registrations.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {fields.map((f) => (
                      <th key={f.id} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Registered</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {regLoading && (
                    <tr>
                      <td colSpan={fields.length + 3} className="px-4 py-8 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!regLoading && registrations.length === 0 && (
                    <tr>
                      <td colSpan={fields.length + 3} className="px-4 py-8 text-center text-muted-foreground">
                        No registrations yet.
                      </td>
                    </tr>
                  )}
                  {registrations.map((reg) => (
                    <tr key={reg._id} className="border-b hover:bg-muted/30">
                      {fields.map((f) => {
                        const val = reg.responses?.[f.id];
                        let display: string;
                        if (typeof val === "boolean") display = val ? "Yes" : "No";
                        else display = val != null ? String(val) : "—";
                        return (
                          <td key={f.id} className="px-4 py-3 max-w-[200px] truncate">
                            {display}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[reg.status] || ""}>
                          {reg.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(reg.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {reg.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRegStatus(reg._id, "approved")}
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRegStatus(reg._id, "rejected")}
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {reg.status === "approved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRegStatus(reg._id, "completed")}
                              title="Mark completed"
                            >
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReg(reg._id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main events view
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRegs}</p>
              <p className="text-xs text-muted-foreground">Total Registrations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Volunteers</h1>
          <p className="text-muted-foreground">Create and manage volunteer events & registrations</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Event
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Events list */}
      {loading && <div className="py-10 text-center text-muted-foreground">Loading...</div>}

      {!loading && filtered.length === 0 && (
        <div className="py-10 text-center text-muted-foreground">No volunteer events found.</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <Card key={event._id} className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
            {event.image && (
              <div className="relative h-36 w-full bg-muted">
                <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
              </div>
            )}
            <CardContent className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <Badge className={STATUS_COLORS[event.status] || ""}>{event.status}</Badge>
                <span className="text-xs text-muted-foreground">{event.category}</span>
              </div>
              <h3 className="mb-1 font-semibold text-lg leading-tight">{event.title}</h3>
              <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{event.description}</p>

              <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>
                    {event.filledSlots}{event.slots > 0 ? `/${event.slots}` : ""} registered
                    {event.slots === 0 ? " (unlimited)" : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-border pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setViewingEvent(event);
                    fetchRegistrations(event._id);
                  }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> Registrations
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(event)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(event._id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background p-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editing ? "Edit Volunteer Event" : "Create Volunteer Event"}
                </h2>
                <button onClick={() => setShowForm(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Event details */}
                <Input
                  placeholder="Event Title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <Textarea
                  placeholder="Description *"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Start Date *</label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">End Date (optional)</label>
                    <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
                <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <Input placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Max Volunteers (0 = unlimited)</label>
                    <Input type="number" min={0} value={form.slots} onChange={(e) => setForm({ ...form, slots: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <Textarea placeholder="Requirements or notes for volunteers (optional)" rows={2} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />

                {/* Form Builder */}
                <div className="border-t border-border pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">Registration Form Fields</h3>
                      <p className="text-xs text-muted-foreground">
                        Customize what information volunteers need to fill in
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={addField}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="rounded-lg border border-border bg-card p-3"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col gap-0.5 pt-1">
                            <button
                              type="button"
                              onClick={() => moveField(idx, -1)}
                              disabled={idx === 0}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveField(idx, 1)}
                              disabled={idx === formFields.length - 1}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex-1 grid grid-cols-12 gap-2">
                            <div className="col-span-4">
                              <Input
                                placeholder="Field Label *"
                                value={field.label}
                                onChange={(e) => updateField(idx, { label: e.target.value })}
                                className="text-sm"
                              />
                            </div>
                            <div className="col-span-3">
                              <select
                                className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                                value={field.type}
                                onChange={(e) => updateField(idx, { type: e.target.value, options: [] })}
                              >
                                {FIELD_TYPES.map((t) => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-3">
                              <Input
                                placeholder="Placeholder"
                                value={field.placeholder}
                                onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                                className="text-sm"
                              />
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                              <label className="flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => updateField(idx, { required: e.target.checked })}
                                  className="rounded"
                                />
                                Required
                              </label>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeField(idx)}
                            className="mt-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {(field.type === "select") && (
                          <div className="mt-2 ml-6">
                            <label className="text-xs text-muted-foreground">
                              Options (comma-separated)
                            </label>
                            <Input
                              placeholder="Option 1, Option 2, Option 3"
                              value={field.options.join(", ")}
                              onChange={(e) =>
                                updateField(idx, {
                                  options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                                })
                              }
                              className="mt-1 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {formFields.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No form fields. Click &quot;Add Field&quot; to start building your registration form.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                    {submitting
                      ? editing ? "Updating..." : "Creating..."
                      : editing ? "Update Event" : "Create Event"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
