"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { VbButton } from "../../ui/Button";
import { FormField, VbInput } from "../../ui/Fields";

const empty = { name: "", email: "", password: "", canCollectCash: false };
type Form = typeof empty;

/** Creates a volunteer login (site admins are managed elsewhere). */
export default function AddStaffModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: (form: Form) => void }) {
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm(empty);
      setError("");
    }
  }, [isOpen]);

  const bind = (name: "name" | "email" | "password") => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [name]: e.target.value })),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await authApi.createUser(form);
      onCreated(form);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create the account"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white text-gray-900">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Add staff</DialogTitle>
          </DialogHeader>
          <FormField id="staff-name" label="Name" required>
            <VbInput id="staff-name" placeholder="Full name" autoComplete="off" {...bind("name")} />
          </FormField>
          <FormField id="staff-email" label="Email" required>
            <VbInput id="staff-email" type="email" placeholder="staff@example.com" autoComplete="off" {...bind("email")} />
          </FormField>
          <FormField id="staff-password" label="Password" required hint="At least 8 characters. Share it with them privately.">
            <VbInput id="staff-password" type="password" autoComplete="new-password" {...bind("password")} />
          </FormField>
          <p className="-mt-2 text-xs text-gray-500">Volunteers can use the QR scanner and see the scanned list only.</p>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={form.canCollectCash}
              onChange={(e) => setForm((prev) => ({ ...prev, canCollectCash: e.target.checked }))}
              className="mt-1 h-4 w-4 accent-[#20603d]"
            />
            <span>
              <span className="block text-sm font-semibold leading-tight">Can take cash payments</span>
              <span className="block text-xs text-gray-600">Gets the Cash desk: registers walk-ins, takes the cash and sends them their QR on WhatsApp.</span>
            </span>
          </label>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <DialogFooter className="gap-2">
            <VbButton variant="ghost" onClick={onClose}>Cancel</VbButton>
            <VbButton type="submit" loading={saving}>Create account</VbButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
