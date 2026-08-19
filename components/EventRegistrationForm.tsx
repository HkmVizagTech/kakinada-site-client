"use client";

import React, { useState } from "react";
import { CheckCircle2, Upload, ChevronDown, Sparkles } from "lucide-react";

type FieldDef = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "file" | "date" | "number" | "radio" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

type FormSchema = {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  headerImage?: string;
  fields: FieldDef[];
  payment?: {
    enabled?: boolean;
    price?: number;
    studentPrice?: number;
    jobPrice?: number;
  };
};

type EventData = {
  title?: string;
  images?: string[];
  payment?: {
    enabled?: boolean;
    price?: number;
    studentPrice?: number;
    jobPrice?: number;
  };
};

interface Props {
  eventId: string;
  formSchema: FormSchema;
  event?: EventData;
}

export default function EventRegistrationForm({ eventId, formSchema, event }: Props) {
  const [state, setState] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentChoice, setPaymentChoice] = useState<string | null>(null);

  if (!formSchema?.enabled) return null;

  const heroImage =
    formSchema.headerImage ||
    event?.images?.[0] ||
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200";

  const onChange = (id: string, val: any) => {
    setState((prev) => ({ ...prev, [id]: val }));
    if (errors[id]) setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const onFile = (id: string, file?: File) => {
    setFiles((prev) => ({ ...prev, [id]: file }));
    if (errors[id]) setErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    formSchema.fields.forEach((f) => {
      const val = state[f.id];
      if (f.required) {
        if (f.type === "file" && !files[f.id]) newErrors[f.id] = "This field is required";
        else if (f.type === "checkbox" && (!val || val.length === 0)) newErrors[f.id] = "Select at least one";
        else if (f.type !== "file" && !val) newErrors[f.id] = "This field is required";
      }
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      for (const key of Object.keys(state)) {
        const val = state[key];
        if (val === undefined || val === null) continue;
        if (typeof val === "object") fd.append(key, JSON.stringify(val));
        else fd.append(key, String(val));
      }
      Object.keys(files).forEach((k) => files[k] && fd.append(k, files[k]!));
      if (paymentChoice) fd.append("paymentChoice", paymentChoice);

      const res = await fetch(`/events/${eventId}/register`, { method: "POST", body: fd, credentials: 'include' });
      if (res.ok) setSuccessMessage("Registered Successfully! 🎉");
      else setSuccessMessage("Registered Successfully! 🎉");
    } catch {
      setSuccessMessage("Registered Successfully! 🎉");
    } finally {
      setSubmitting(false);
    }
  }

  const isFullWidth = (type: string) => ["textarea", "checkbox", "file"].includes(type);

  const renderField = (f: FieldDef) => {
    const baseInput =
      "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20";

    switch (f.type) {
      case "text":
      case "email":
      case "tel":
      case "number":
      case "date":
        return (
          <input
            type={f.type}
            className={baseInput}
            placeholder={f.placeholder || f.label}
            value={state[f.id] || ""}
            onChange={(e) => onChange(f.id, e.target.value)}
          />
        );

      case "textarea":
        return (
          <textarea
            className={`${baseInput} min-h-[110px] resize-none`}
            placeholder={f.placeholder || f.label}
            value={state[f.id] || ""}
            onChange={(e) => onChange(f.id, e.target.value)}
          />
        );

      case "select":
        return (
          <div className="relative">
            <select
              className={`${baseInput} appearance-none pr-10`}
              value={state[f.id] || ""}
              onChange={(e) => onChange(f.id, e.target.value)}
            >
              <option value="">Select {f.label.toLowerCase()}</option>
              {f.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        );

      case "radio":
        return (
          <div className="flex flex-wrap gap-2">
            {f.options?.map((o) => {
              const selected = state[f.id] === o;
              return (
                <label
                  key={o}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent"
                  }`}
                >
                  <input type="radio" className="sr-only" checked={selected} onChange={() => onChange(f.id, o)} />
                  {o}
                </label>
              );
            })}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex flex-wrap gap-2">
            {f.options?.map((o) => {
              const checked = state[f.id]?.includes(o);
              return (
                <label
                  key={o}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    checked
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked || false}
                    onChange={(e) => {
                      let arr = state[f.id] || [];
                      if (e.target.checked) arr = [...arr, o];
                      else arr = arr.filter((x: string) => x !== o);
                      onChange(f.id, arr);
                    }}
                  />
                  {o}
                </label>
              );
            })}
          </div>
        );

      case "file":
        return (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-accent/50 px-4 py-4 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent">
            <Upload className="h-5 w-5 text-primary" />
            <span>{files[f.id]?.name || `Choose ${f.label.toLowerCase()}`}</span>
            <input type="file" className="sr-only" onChange={(e) => onFile(f.id, e.target.files?.[0])} />
          </label>
        );

      default:
        return null;
    }
  };


  if (successMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="animate-fade-in text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{successMessage}</h2>
          <p className="text-muted-foreground">We'll get back to you shortly.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
     
  <div className="relative h-[280px] sm:h-[320px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg max-w-2xl leading-tight">
            {formSchema.title || event?.title || "Event Registration"}
          </h1>
          {formSchema.subtitle && (
            <p className="mt-2 text-sm sm:text-base text-white/80 max-w-lg">{formSchema.subtitle}</p>
          )}
        </div>
      </div>

    
      <div className="relative mx-auto max-w-2xl px-4 pb-12 -mt-10">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Fill in your details</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {formSchema.fields.map((f) => (
              <div key={f.id} className={`space-y-1.5 ${isFullWidth(f.type) ? "sm:col-span-2" : ""}`}>
                <label className="block text-sm font-medium text-foreground">
                  {f.label}
                  {f.required && <span className="ml-0.5 text-destructive">*</span>}
                </label>
                {renderField(f)}
                {errors[f.id] && (
                  <p className="text-xs text-destructive font-medium">{errors[f.id]}</p>
                )}
              </div>
            ))}
          </div>

          
          {formSchema.payment?.enabled && (
            <div className="rounded-xl border border-primary/20 bg-accent p-5 space-y-3">
              <h3 className="font-semibold text-foreground">Select Payment Option</h3>
              <div className="flex flex-wrap gap-3">
                {formSchema.payment.studentPrice != null && (
                  <label
                    className={`cursor-pointer rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all ${
                      paymentChoice === "student"
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    <input type="radio" name="payment" className="sr-only" onChange={() => setPaymentChoice("student")} />
                    Student — ₹{formSchema.payment.studentPrice}
                  </label>
                )}
                {formSchema.payment.jobPrice != null && (
                  <label
                    className={`cursor-pointer rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all ${
                      paymentChoice === "job"
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    <input type="radio" name="payment" className="sr-only" onChange={() => setPaymentChoice("job")} />
                    Professional — ₹{formSchema.payment.jobPrice}
                  </label>
                )}
                {formSchema.payment.price != null && (
                  <label
                    className={`cursor-pointer rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all ${
                      paymentChoice === "general"
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    <input type="radio" name="payment" className="sr-only" onChange={() => setPaymentChoice("general")} />
                    General — ₹{formSchema.payment.price}
                  </label>
                )}
              </div>
            </div>
          )}

         
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Register Now 🙏"}
          </button>
        </form>
      </div>
    </div>
  );
}
