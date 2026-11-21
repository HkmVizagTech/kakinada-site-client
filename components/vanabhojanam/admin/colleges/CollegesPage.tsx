"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, GraduationCap, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { collegesApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { useAsyncData, vbToast } from "@/lib/vanabhojanam/hooks";
import { useVbAuth } from "../../context/VbAuthContext";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { VbButton } from "../../ui/Button";
import { VbInput, VbTextarea } from "../../ui/Fields";
import { ErrorNotice, PageSpinner } from "../../ui/Feedback";
import { PageHeader } from "../AdminKit";

export default function CollegesPage() {
  const readOnly = useVbAuth().role === "viewer"; // devotees may add colleges, not rename or delete them
  const { data, loading, error, reload } = useAsyncData<any[]>((signal) => collegesApi.list(signal), []);
  const colleges = data || [];
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkMode, setBulkMode] = useState(false);

  const visible = useMemo(() => colleges.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())), [colleges, query]);

  const resetForm = useCallback(() => {
    setName("");
    setEditingId(null);
  }, []);

  const save = async () => {
    if (!name.trim()) {
      vbToast({ title: "College name required!", status: "warning" });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await collegesApi.update(editingId, name.trim());
        vbToast({ title: "College updated.", status: "success" });
      } else {
        await collegesApi.create(name.trim());
        vbToast({ title: "College added.", status: "success" });
      }
      resetForm();
      await reload();
    } catch (err) {
      vbToast({ title: "Error", description: getErrorMessage(err, "Failed"), status: "error" });
    } finally {
      setSaving(false);
    }
  };

  const saveBulk = async () => {
    const names = bulkText.split("\n").map((n) => n.trim()).filter(Boolean);
    if (!names.length) return;
    setSaving(true);
    try {
      const { created, skipped } = await collegesApi.bulk(names);
      vbToast({ title: `${created} college${created === 1 ? "" : "s"} added`, description: skipped ? `${skipped} skipped (already in the list)` : undefined, status: "success" });
      setBulkText("");
      setBulkMode(false);
      await reload();
    } catch (err) {
      vbToast({ title: "Error", description: getErrorMessage(err, "Failed"), status: "error" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await collegesApi.remove(toDelete._id);
      vbToast({ title: "College deleted.", status: "info" });
      if (editingId === toDelete._id) resetForm();
      await reload();
    } catch {
      vbToast({ title: "Delete failed.", status: "error" });
    } finally {
      setSaving(false);
      setToDelete(null);
    }
  };

  if (loading && colleges.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader title="College Manager" subtitle="Add, edit, or remove colleges for your system." />
      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch colleges." />

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vb-brand-50 text-vb-brand-600">
            <GraduationCap className="h-5 w-5" />
          </div>
          <p className="font-bold">{editingId ? "Edit college" : "Add a college"}</p>
        </div>
        {bulkMode ? (
          <>
            <VbTextarea
              placeholder={"One college per line, for example:\nJNTU Kakinada\nAditya University\nPragati Engineering College"}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              aria-label="Colleges, one per line"
            />
            <div className="flex gap-2">
              <VbButton className="flex-1" leftIcon={<Plus className="h-4 w-4" />} onClick={saveBulk} loading={saving} disabled={!bulkText.trim()}>
                Add all
              </VbButton>
              <VbButton variant="ghost" onClick={() => setBulkMode(false)}>Cancel</VbButton>
            </div>
          </>
        ) : (
          <>
            <VbInput
              placeholder="Enter College Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              aria-label="College name"
            />
            <div className="flex gap-2">
              <VbButton
                className="flex-1"
                leftIcon={editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                onClick={save}
                loading={saving}
                disabled={!name.trim()}
              >
                {editingId ? "Update College" : "Add College"}
              </VbButton>
              {editingId ? (
                <VbButton variant="ghost" onClick={resetForm}>Cancel Edit</VbButton>
              ) : (
                <VbButton variant="outline" onClick={() => setBulkMode(true)}>Add many at once</VbButton>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold">{colleges.length === 0 ? "No colleges yet." : `All Colleges (${colleges.length})`}</p>
        <div className="relative w-full max-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <VbInput inputSize="sm" className="pl-8" placeholder="Search colleges" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search colleges" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {visible.map((college) => (
          <div
            key={college._id}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg border bg-white px-4 py-2 transition-all duration-200 hover:border-vb-brand-300 hover:shadow-md",
              editingId === college._id ? "border-vb-brand-400" : "border-black/10"
            )}
          >
            <p className="flex-1 break-words">{college.name}</p>
            {!readOnly && (
              <div className="flex shrink-0 gap-1">
                <VbButton
                  variant="ghost"
                  size="sm"
                  className="w-9 rounded-full px-0"
                  aria-label={`Edit ${college.name}`}
                  onClick={() => {
                    setName(college.name);
                    setEditingId(college._id);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </VbButton>
                <VbButton variant="ghost" size="sm" className="w-9 rounded-full px-0 text-red-600 hover:bg-red-50" aria-label={`Delete ${college.name}`} onClick={() => setToDelete(college)}>
                  <Trash2 className="h-4 w-4" />
                </VbButton>
              </div>
            )}
          </div>
        ))}
        {colleges.length > 0 && visible.length === 0 && <p className="py-6 text-center text-gray-600">No colleges match &quot;{query}&quot;.</p>}
      </div>

      <ConfirmDialog isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={remove} confirmLabel="Delete" isLoading={saving} title="Delete college">
        Delete <strong>{toDelete?.name}</strong>? Existing registrations keep their college name.
      </ConfirmDialog>
    </div>
  );
}
