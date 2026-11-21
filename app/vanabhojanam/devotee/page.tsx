"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/vanabhojanam/ui/AuthCard";
import { FormField, VbInput, VbInputGroup } from "@/components/vanabhojanam/ui/Fields";
import { VbButton } from "@/components/vanabhojanam/ui/Button";
import { homeForRole, useVbAuth } from "@/components/vanabhojanam/context/VbAuthContext";
import { devoteesApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { vbToast } from "@/lib/vanabhojanam/hooks";

/** Devotee sign-in: WhatsApp number, then the 6-digit code sent to it. View-only access to registrations and attendance. */
export default function DevoteeLoginPage() {
  const router = useRouter();
  const { status, role, loginWithToken } = useVbAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  useEffect(() => {
    if (status === "authenticated" || status === "unverified") router.replace(homeForRole(role));
  }, [status, role, router]);

  const fail = (title: string, err: unknown) => vbToast({ title, description: getErrorMessage(err), status: "error", duration: 5000 });

  const sendCode = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) return vbToast({ title: "Enter your 10-digit WhatsApp number", status: "warning", duration: 3000 });
    setBusy(true);
    try {
      const res = await devoteesApi.requestCode(phone);
      setSent(true);
      setWait(60);
      vbToast({ title: "Code sent", description: res.message, status: "success", duration: 4000 });
    } catch (err) {
      fail("Could not send the code", err);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await devoteesApi.verifyCode(phone, code);
      loginWithToken(data);
      router.replace(homeForRole(data.role));
    } catch (err) {
      fail("Could not sign in", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Devotee Login" subtitle="Sign in with a code sent to your WhatsApp">
      <form onSubmit={sent ? verify : sendCode} className="flex flex-col gap-4">
        <FormField id="phone" label="WhatsApp number" required>
          <VbInputGroup prefix="+91">
            <VbInput id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Your WhatsApp number" value={phone} readOnly={sent} onChange={(e) => setPhone(e.target.value)} />
          </VbInputGroup>
        </FormField>
        {sent && (
          <FormField id="otp" label="6-digit code" required>
            <VbInput id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Enter the code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} autoFocus />
          </FormField>
        )}
        <VbButton type="submit" variant="festival" loading={busy} className="w-full">
          {sent ? "Verify and sign in" : "Send code on WhatsApp"}
        </VbButton>
        {sent && (
          <>
            <button type="button" className="text-sm font-semibold text-vb-brand-600 underline disabled:opacity-50 disabled:no-underline" onClick={sendCode} disabled={wait > 0 || busy}>
              {wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
            </button>
            <button type="button" className="text-sm font-semibold text-vb-brand-600 underline" onClick={() => { setSent(false); setCode(""); }}>
              Use a different number
            </button>
          </>
        )}
        <p className="text-center text-xs text-gray-600">Only numbers added by the temple office can sign in. You will be able to view, not change, the data.</p>
      </form>
    </AuthCard>
  );
}
