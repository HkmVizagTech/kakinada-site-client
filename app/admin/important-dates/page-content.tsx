"use client";
import { authFetch } from "@/lib/authClient";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ImportantDate = {
  _id: string;
  title: string;
  date: string;
  description?: string;
  type: "Ekadashi" | "Festival" | "Other";
};

export default function AdminImportantDatesPage() {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ImportantDate | null>(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Partial<ImportantDate>>();

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";
  async function fetchDates() {
    const res = await authFetch(`${apiUrl}/important-dates`, { credentials: "include" });
    const data = await res.json();
    setDates(Array.isArray(data) ? data : data.dates || []);
  }

  useEffect(() => {
    fetchDates();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ title: "", date: "", description: "", type: "Other" });
    setShowForm(true);
  };

  const openEdit = (date: ImportantDate) => {
    setEditing(date);
    setValue("title", date.title);
    setValue("date", date.date.slice(0, 10));
    setValue("description", date.description || "");
    setValue("type", date.type || "Other");
    setShowForm(true);
  };

  async function onSubmit(data: Partial<ImportantDate>) {
    if (editing) {
      await authFetch(`${apiUrl}/important-dates/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
    } else {
      await authFetch(`${apiUrl}/important-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
    }
    setShowForm(false);
    reset();
    fetchDates();
  }

  async function handleDelete(id: string) {
    await authFetch(`${apiUrl}/important-dates/${id}`, { method: "DELETE", credentials: "include" });
    fetchDates();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Important Dates</h1>
          <p className="text-muted-foreground">Manage Ekadashis and festival dates</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Date</Button>
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
                  {editing ? "Edit Date" : "Add Important Date"}
                </h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <Input placeholder="Title" {...register("title", { required: true })} />
                {errors.title && <p className="text-destructive text-xs mt-1">Title is required</p>}
                <Input type="date" {...register("date", { required: true })} />
                {errors.date && <p className="text-destructive text-xs mt-1">Date is required</p>}
                <Textarea placeholder="Description" {...register("description")} rows={3} />
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("type")}
                  defaultValue={editing?.type || "Other"}
                >
                  <option value="Ekadashi">Ekadashi</option>
                  <option value="Festival">Festival</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" onClick={handleSubmit(onSubmit)}>
                    {editing ? "Update Date" : "Add Date"}
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
      <div className="grid gap-4">
        {dates.map((date) => (
          <Card key={date._id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading font-bold text-lg">{date.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${date.type === "Festival" ? "bg-yellow-200 text-yellow-800" : date.type === "Ekadashi" ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"}`}>{date.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(date.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  {date.description && <p className="text-sm text-muted-foreground mb-2">{date.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(date)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(date._id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
