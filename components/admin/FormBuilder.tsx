"use client";

import React, { useState } from "react";

export type FieldDef = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "file" | "date" | "number" | "radio" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for select, radio, checkbox
};

type FormSchema = {
  enabled?: boolean;
  fields: FieldDef[];
  title?: string;
  headerImage?: string;
  payment?: {
    enabled?: boolean;
    price?: number;
    studentPrice?: number;
    jobPrice?: number;
  };
};

export default function FormBuilder({
  value,
  onChange,
  onClose,
  onSave,
}: {
  value?: FormSchema;
  onChange: (v: FormSchema) => void;
  onClose: () => void;
  onSave?: (v: FormSchema) => void;
}) {
  const initial: FormSchema = value || { enabled: false, fields: [] };
  const [schema, setSchema] = useState<FormSchema>(initial);
  const [newFieldType, setNewFieldType] = useState<FieldDef["type"]>("text");

  function addField() {
    const id = `f_${Date.now()}`;
    setSchema((s) => ({
      ...s,
      fields: [...s.fields, { id, label: "New Field", type: newFieldType, required: false, placeholder: "", options: [] }],
    }));
  }

  function updateField(id: string, patch: Partial<FieldDef>) {
    setSchema((s) => ({
      ...s,
      fields: s.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  }

  function removeField(id: string) {
    setSchema((s) => ({ ...s, fields: s.fields.filter((f) => f.id !== id) }));
  }

  function moveField(id: string, dir: -1 | 1) {
    setSchema((s) => {
      const idx = s.fields.findIndex((f) => f.id === id);
      if (idx === -1) return s;
      const next = idx + dir;
      if (next < 0 || next >= s.fields.length) return s;
      const fields = [...s.fields];
      const [moved] = fields.splice(idx, 1);
      fields.splice(next, 0, moved);
      return { ...s, fields };
    });
  }

  return (
    <div className="space-y-4 max-h-[80vh] overflow-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold">Registration Form Builder</h3>
          <p className="text-sm text-muted-foreground">Add fields below and preview the form on the right.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">Enable</label>
          <input type="checkbox" checked={!!schema.enabled} onChange={(e) => setSchema({ ...schema, enabled: e.target.checked })} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
  <input className="w-full rounded-md border px-2 py-1" placeholder="Form title (optional)" value={schema.title || ""} onChange={(e) => setSchema({ ...schema, title: e.target.value })} />
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            className="rounded-md"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                setSchema({ ...schema, headerImage: String(reader.result) });
              };
              reader.readAsDataURL(f);
            }}
          />
          {schema.headerImage && (
            <div className="flex items-center gap-2">
              <img src={schema.headerImage} alt="preview" className="w-24 h-12 object-cover rounded-md border" />
              <button type="button" className="text-sm text-destructive" onClick={() => setSchema({ ...schema, headerImage: undefined })}>Remove</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">Enable Payment</label>
          <input type="checkbox" checked={!!schema.payment?.enabled} onChange={(e) => setSchema({ ...schema, payment: { ...(schema.payment || {}), enabled: e.target.checked } })} />
        </div>
        {schema.payment?.enabled && (
          <div className="grid grid-cols-3 gap-2">
            <input type="number" className="rounded-md border px-2 py-1" placeholder="Single price (₹)" value={schema.payment?.price ?? ""} onChange={(e) => setSchema({ ...schema, payment: { ...(schema.payment || {}), price: e.target.value ? Number(e.target.value) : undefined } })} />
            <input type="number" className="rounded-md border px-2 py-1" placeholder="Student price (₹)" value={schema.payment?.studentPrice ?? ""} onChange={(e) => setSchema({ ...schema, payment: { ...(schema.payment || {}), studentPrice: e.target.value ? Number(e.target.value) : undefined } })} />
            <input type="number" className="rounded-md border px-2 py-1" placeholder="Job price (₹)" value={schema.payment?.jobPrice ?? ""} onChange={(e) => setSchema({ ...schema, payment: { ...(schema.payment || {}), jobPrice: e.target.value ? Number(e.target.value) : undefined } })} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="overflow-y-auto max-h-[60vh] pr-2">
          {schema.fields.map((f, idx) => (
            <div key={f.id} className="p-3 border rounded-md bg-card flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <strong>{f.label}</strong>
                <div className="flex gap-2">
                  <button className="text-sm text-muted-foreground" onClick={() => moveField(f.id, -1)} disabled={idx === 0}>↑</button>
                  <button className="text-sm text-muted-foreground" onClick={() => moveField(f.id, 1)} disabled={idx === schema.fields.length - 1}>↓</button>
                  <button className="text-sm text-destructive" onClick={() => removeField(f.id)}>Remove</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded-md border px-2 py-1" value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })} placeholder="Label" />
                <input className="rounded-md border px-2 py-1" value={f.id} onChange={(e) => updateField(f.id, { id: e.target.value })} placeholder="key-id" />
                <select className="rounded-md border px-2 py-1" value={f.type} onChange={(e) => updateField(f.id, { type: e.target.value as any })}>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                  <option value="radio">Radio</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="file">File</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })} />
                  <span className="text-sm">Required</span>
                </label>
              </div>
              <div className="mt-2">
                <input className="w-full rounded-md border px-2 py-1" value={f.placeholder || ""} onChange={(e) => updateField(f.id, { placeholder: e.target.value })} placeholder="Placeholder (optional)" />
              </div>
              {(f.type === "select" || f.type === "radio" || f.type === "checkbox") && (
                <div className="mt-2">
                  <small className="text-muted-foreground">Options (comma separated)</small>
                  <input className="w-full rounded-md border px-2 py-1 mt-1" value={(f.options || []).join(",")} onChange={(e) => updateField(f.id, { options: e.target.value.split(",").map((s) => s.trim()) })} />
                </div>
              )}
            </div>
          ))}
          </div>
        </div>

        <div className="p-4 border rounded-md bg-background">
          <h4 className="font-semibold mb-3">Preview</h4>
          {!schema.enabled && <p className="text-sm text-muted-foreground">Form is disabled. Toggle Enable to preview live form.</p>}
          <form className="space-y-3">
            {schema.fields.map((f) => (
              <div key={`preview-${f.id}`}>
                <label className="block text-sm mb-1">{f.label}</label>
                {f.type === "text" && <input className="w-full rounded-md border px-2 py-1" placeholder={f.placeholder} disabled={!schema.enabled} />}
                {f.type === "email" && <input type="email" className="w-full rounded-md border px-2 py-1" placeholder={f.placeholder} disabled={!schema.enabled} />}
                {f.type === "tel" && <input type="tel" className="w-full rounded-md border px-2 py-1" placeholder={f.placeholder} disabled={!schema.enabled} />}
                {f.type === "number" && <input type="number" className="w-full rounded-md border px-2 py-1" placeholder={f.placeholder} disabled={!schema.enabled} />}
                {f.type === "date" && <input type="date" className="w-full rounded-md border px-2 py-1" disabled={!schema.enabled} />}
                {f.type === "textarea" && <textarea className="w-full rounded-md border px-2 py-1" placeholder={f.placeholder} disabled={!schema.enabled} />}
                {f.type === "select" && <select className="w-full rounded-md border px-2 py-1" disabled={!schema.enabled}><option>Select</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>}
                {f.type === "radio" && <div className="flex gap-3">{f.options?.map((o) => <label key={o}><input type="radio" disabled={!schema.enabled} /> {o}</label>)}</div>}
                {f.type === "checkbox" && <div className="flex gap-3">{f.options?.map((o) => <label key={o}><input type="checkbox" disabled={!schema.enabled} /> {o}</label>)}</div>}
                {f.type === "file" && <input type="file" className="w-full" disabled={!schema.enabled} />}
              </div>
            ))}
          </form>
        </div>
      </div>

  <div className="flex items-center gap-2">
        <select className="rounded-md border px-2 py-1" value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as any)}>
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="tel">Phone</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="textarea">Textarea</option>
          <option value="select">Select</option>
          <option value="radio">Radio</option>
          <option value="checkbox">Checkbox</option>
          <option value="file">File</option>
        </select>
        <button type="button" className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow-warm hover:opacity-90 transition" onClick={addField}>
          Add Field
        </button>
      </div>

      <div className="flex gap-2 justify-end sticky bottom-0 bg-background pt-4">
        <button type="button" className="rounded-md px-4 py-2 bg-primary text-primary-foreground" onClick={() => { onChange(schema); if (onSave) onSave(schema); onClose(); }}>
          Save
        </button>
        <button type="button" className="rounded-md px-4 py-2 border" onClick={() => onClose()}>Cancel</button>
      </div>
    </div>
  );
}
