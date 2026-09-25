"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { getDonorToken, donorFetch } from "@/lib/donorAuthClient";
import type { PrasadamAddress } from "@/components/AddressForm";

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

export interface DonorPrefillProfile {
  name: string;
  mobile: string;
  email: string;
  panNumber: string;
  savedAddress?: PrasadamAddress | null;
  /** "login" = logged-in donor's own profile; "lookup" = phone lookup. */
  source: "login" | "lookup";
}

// Full donor profile for a logged-in donor (donor token present). Returns
// null when not logged in or the session has expired, so the checkout form
// silently falls back to manual entry.
export async function fetchLoggedInDonorProfile(): Promise<DonorPrefillProfile | null> {
  if (!getDonorToken()) return null;
  try {
    const res = await donorFetch(`${apiBase()}/donor/me`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.donor) return null;
    const d = data.donor;
    return {
      name: d.name || "",
      mobile: d.mobile || "",
      email: d.email || "",
      panNumber: d.panNumber || "",
      savedAddress: d.savedAddress || null,
      source: "login",
    };
  } catch {
    return null;
  }
}

// Public phone lookup for a donor who donated before but isn't logged in.
// If the number has a Donor record, returns their saved identity details so
// the form can fill name/email (and lazily the PAN/address when 80G/prasadam
// are selected). Returns null for unknown numbers or lookup failures.
export async function lookupDonorByMobile(mobile: string): Promise<DonorPrefillProfile | null> {
  const clean = String(mobile || "").replace(/\D/g, "").slice(-10);
  if (clean.length !== 10) return null;
  try {
    const res = await fetch(`${apiBase()}/donor-auth/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: clean }),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.donor) return null;
    const d = data.donor;
    return {
      name: d.name || "",
      mobile: d.mobile || "",
      email: d.email || "",
      panNumber: d.panNumber || "",
      savedAddress: d.savedAddress || null,
      source: "lookup",
    };
  } catch {
    return null;
  }
}

// Minimal shape every donation form's donor details share — enough for the
// prefill logic to work regardless of the form's extra fields (address,
// sevak name, campaign-specific quantities, etc.).
export interface DonorFormLike {
  name: string;
  email: string;
  mobile: string;
  panNumber?: string;
}

// Maps the donor columns onto a form's own field names when a form doesn't
// use the conventional name/email/mobile/panNumber keys (e.g. festival forms
// that store donorName/donorMobile/donorEmail).
export interface DonorFieldMap {
  name?: string;
  email?: string;
  mobile?: string;
  panNumber?: string;
}

type FormSetter<TForm> = (updater: (prev: TForm) => TForm) => void;

interface UseDonorPrefillOptions<TForm extends object> {
  form: TForm;
  setForm: FormSetter<TForm>;
  /** Field-key mapping for forms that don't use name/email/mobile/panNumber. */
  fieldMap?: DonorFieldMap;
  /** Called with the donor's saved address when they tick Maha Prasadam and
      the form's address fields are still blank — lets each form map the
      shared saved-address shape onto its own address inputs. */
  onMahaPrasadamSelect?: (address: PrasadamAddress) => void;
  /** When true, the phone-lookup helper strip is suppressed (e.g. forms with
      no standalone mobile field). Defaults to false. */
  disablePhoneLookup?: boolean;
}

const PRASADAM_BLANK_KEYS: (keyof PrasadamAddress)[] = ["street", "city", "state", "pincode"];

const readField = <TForm extends object>(f: TForm, key: string): string | undefined =>
  (f as Record<string, unknown>)[key] as string | undefined;

/**
 * Shared donor pre-fill behaviour for every donation form:
 *
 * 1. Logged-in donor (donor token present): fetches /donor/me and fills the
 *    name/email/mobile fields automatically on mount.
 * 2. Not logged in but donated before: when the donor finishes typing a
 *    10-digit mobile, looks their record up and fills the same fields (plus
 *    lazily their PAN/address when 80G/prasadam are later selected).
 * 3. PAN and Mukha-Prasadam address are ONLY filled once the donor opts into
 *    the 80G receipt / Maha Prasadam — never shown upfront.
 */
export function useDonorPrefill<TForm extends object>({
  form,
  setForm,
  fieldMap,
  onMahaPrasadamSelect,
  disablePhoneLookup = false,
}: UseDonorPrefillOptions<TForm>) {
  const [prefill, setPrefill] = useState<DonorPrefillProfile | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const [lookupMobile, setLookupMobile] = useState("");
  // Guards against a phone lookup querying a mobile we already know from a
  // more authoritative source (the logged-in donor's own profile).
  const appliedLoginRef = useRef(false);
  // Keep the latest setForm without making it an effect dependency (the
  // useState setter is stable in practice, but this stays correct even for
  // wrapped setters).
  const setFormRef = useRef<FormSetter<TForm> | null>(null);
  setFormRef.current = setForm;

  const key = {
    name: fieldMap?.name ?? "name",
    email: fieldMap?.email ?? "email",
    mobile: fieldMap?.mobile ?? "mobile",
    panNumber: fieldMap?.panNumber ?? "panNumber",
  };

  useEffect(() => {
    let cancelled = false;
    fetchLoggedInDonorProfile().then((profile) => {
      if (cancelled || !profile) return;
      appliedLoginRef.current = true;
      setLoggedIn(true);
      setPrefill(profile);
      setFormRef.current?.(f => ({
        ...f,
        [key.name]: readField(f, key.name) || profile.name,
        [key.email]: readField(f, key.email) || profile.email,
        [key.mobile]: readField(f, key.mobile) || profile.mobile,
      } as TForm));
    });
    return () => {
      cancelled = true;
    };
  // Key names never change for a given form instance.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mobileValue = readField(form, key.mobile)?.trim() ?? "";

  useEffect(() => {
    if (disablePhoneLookup) return;
    const mobile = mobileValue;
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setLookupState("idle");
      setLookupMobile("");
      return;
    }
    if (appliedLoginRef.current) return; // already filled from the donor's own login
    if (lookupMobile === mobile) return; // already asked about this number
    setLookupMobile(mobile);
    setLookupState("loading");
    const timer = setTimeout(async () => {
      const profile = await lookupDonorByMobile(mobile);
      if (!profile) {
        setLookupState("notfound");
        return;
      }
      setLookupState("found");
      // Fill in blanks only — never overwrite something the donor typed.
      setPrefill((prev) => (prev && prev.source === "login" ? prev : profile));
      setFormRef.current?.(f => ({
        ...f,
        [key.name]: readField(f, key.name) || profile.name,
        [key.email]: readField(f, key.email) || profile.email,
        [key.mobile]: readField(f, key.mobile) || profile.mobile,
      } as TForm));
    }, 600);
    return () => clearTimeout(timer);
  // Key names never change for a given form instance.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileValue, lookupMobile, disablePhoneLookup]);

  // PAN is filled only AFTER the donor opts into an 80G receipt.
  const handle80GToggle = (checked: boolean) => {
    if (checked && !readField(form, key.panNumber)?.trim() && prefill?.panNumber) {
      setFormRef.current?.(f => ({ ...f, [key.panNumber]: prefill.panNumber } as TForm));
    }
  };

  // Saved address is filled only AFTER the donor opts into Maha Prasadam.
  const handlePrasadamToggle = (checked: boolean) => {
    if (checked && prefill?.savedAddress) {
      const saved = prefill.savedAddress;
      const blank = PRASADAM_BLANK_KEYS.every((k) => !saved[k]?.trim());
      if (!blank) onMahaPrasadamSelect?.(saved);
    }
  };

  // Compact helper strip shown while/after a phone lookup — lets a returning
  // donor know their details were auto-filled (or that none were found).
  let hint: ReactNode | null = null;
  if (loggedIn && prefill) {
    hint = (
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-medium text-emerald-700">
        ✓ Donating as <span className="font-semibold">{prefill.name}</span> — your details are pre-filled.
      </p>
    );
  } else if (!disablePhoneLookup && lookupState !== "idle") {
    if (lookupState === "loading") {
      hint = (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Finding your details…
        </p>
      );
    } else if (lookupState === "found" && prefill) {
      hint = (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-medium text-emerald-700">
          ✓ Welcome back! We&apos;ve filled your details from your previous donation.
        </p>
      );
    } else if (lookupState === "notfound") {
      hint = (
        <p className="text-[11px] text-muted-foreground">
          No donation found on this number — you can still donate, just fill in your details below.
        </p>
      );
    }
  }

  return {
    prefill,
    loggedIn,
    lookupHint: hint,
    handle80GToggle,
    handlePrasadamToggle,
  };
}
