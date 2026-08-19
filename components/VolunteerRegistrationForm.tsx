"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VolunteerEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  location?: string;
  image?: string;
  status?: string;
  formFields?: Array<{
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
}

interface Props {
  event: VolunteerEvent;
  apiBase: string;
  variant?: "page" | "modal";
  onClose?: () => void;
}

export default function VolunteerRegistrationForm({
  event,
  apiBase,
  variant = "page",
  onClose,
}: Props) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = event.formFields || [];

  const handleChange = (fieldId: string, value: string) => {
    setForm((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    const missing = fields
      .filter((f) => f.required && !form[f.id]?.trim())
      .map((f) => f.label);
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/volunteers/${event._id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: form }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/30">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="mb-2 text-lg font-bold text-green-800 dark:text-green-200">
          Registration Confirmed!
        </h3>
        <p className="mb-4 text-sm text-green-700 dark:text-green-300">
          Thank you for registering to volunteer for {event.title}. We&apos;ll
          be in touch with more details.
        </p>
        <Link href="/volunteer">
          <Button variant="outline" className="rounded-full">
            View Other Volunteer Opportunities
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No additional information required. Click below to register.
        </p>
      ) : (
        fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="mb-1 block text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.id}
                placeholder={field.placeholder}
                required={field.required}
                value={form[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                rows={3}
              />
            ) : field.type === "select" ? (
              <select
                id={field.id}
                required={field.required}
                value={form[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.id}
                type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                placeholder={field.placeholder}
                required={field.required}
                value={form[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            )}
          </div>
        ))
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Register to Volunteer
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {onClose && variant === "modal" && (
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="w-full"
        >
          Cancel
        </Button>
      )}
    </form>
  );
}
