"use client";

// Manual Donation Entry — for donors who paid directly (bank transfer,
// UPI straight to the temple's VPA, cash, cheque) with no Razorpay order
// to reconcile against, OR for existing stuck-pending records where the
// donor paid outside the checkout flow instead of completing it on-site.
//
// Two modes:
//   "new"      — record a brand-new completed donation from a UTR entry.
//   "existing" — search for an existing pending donation and attach a UTR
//                to complete it, avoiding a duplicate record.

import { useState } from "react";
import { authFetch } from "@/lib/authClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CheckCircle2, FileText, UtensilsCrossed } from "lucide-react";
import AddressForm, { type PrasadamAddress } from "@/components/AddressForm";
import DonorExtrasFields from "@/components/DonorExtrasFields";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

const PAYMENT_MODES = [
  { value: "upi", label: "UPI (direct to our VPA)" },
  { value: "bank", label: "Bank Transfer (NEFT/IMPS/RTGS)" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

// Every distinct seva/offering name actually used across the site's
// donation flows (donate/[seva], sevaCampaignConfig, campaignConfig,
// Janmashtami, Shayani Ekadashi, festival programs, Subhojanam) —
// compiled from each source rather than guessed, so admin can match
// what a donor says they paid for. "Other" reveals a free-text field,
// so a seva added to the site later never blocks manual entry.
const SEVA_OPTIONS = [
  "General Seva",
  "Anna Daan Seva",
  "Gau Seva",
  "Gita Daan Seva",
  "Square Foot Seva",
  "Brick Seva",
  "Vastra & Alankara Seva",
  "Pushpalankara Seva",
  "Abhisheka Seva",
  "Tulasi Archana Seva",
  "Makhan Mishri Seva",
  "Naivedhya Seva",
  "Sadhu Bhojan Seva",
  "Rama Taraka Yajna",
  "Panaka Kosambari Seva",
  "Subhojanam",
  "Janmashtami Seva",
  "Donations (General)",
  "Other",
];

const emptyAddress: PrasadamAddress = { street: "", city: "", state: "", pincode: "", country: "India" };

interface PendingMatch {
  _id: string;
  donorName: string;
  donorEmail?: string;
  donorMobile?: string;
  amount: number;
  sevaName?: string;
  type?: string;
  createdAt: string;
  sourcePage?: string;
}

export default function ManualEntryTab() {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ receiptNumber?: string; dccSyncStatus?: string; whatsappSent?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---- Shared payment fields ----
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("bank");
  const [note, setNote] = useState("");

  // ---- "New donation" mode fields ----
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorMobile, setDonorMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [sevaName, setSevaName] = useState(SEVA_OPTIONS[0]);
  const [otherSevaName, setOtherSevaName] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [panNumber, setPanNumber] = useState("");
  const [want80G, setWant80G] = useState(false);
  const [wantPrasadam, setWantPrasadam] = useState(false);
  const [address, setAddress] = useState<PrasadamAddress>(emptyAddress);
  const [sevakName, setSevakName] = useState("");
  const [dob, setDob] = useState("");

  // ---- "Existing pending" mode fields ----
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<PendingMatch[] | null>(null);
  const [selected, setSelected] = useState<PendingMatch | null>(null);

  const resetPaymentFields = () => {
    setUtrNumber("");
    setPaymentMode("bank");
    setNote("");
  };

  const resetNewForm = () => {
    setDonorName(""); setDonorEmail(""); setDonorMobile(""); setAmount("");
    setSevaName(SEVA_OPTIONS[0]); setOtherSevaName(""); setPaymentDate(new Date().toISOString().slice(0, 10));
    setPanNumber(""); setWant80G(false); setWantPrasadam(false); setAddress(emptyAddress);
    setSevakName(""); setDob("");
    resetPaymentFields();
  };

  const searchPending = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setMatches(null);
    setSelected(null);
    try {
      const params = new URLSearchParams({ status: "pending", q: search.trim(), limit: "15" });
      const res = await authFetch(`${API_URL}/donations?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      setMatches(data.donations || []);
    } catch {
      setError("Could not search for pending donations.");
    } finally {
      setSearching(false);
    }
  };

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!donorName.trim()) return setError("Please enter the donor's name.");
    if (sevaName === "Other" && !otherSevaName.trim()) return setError("Please specify the seva/purpose.");
    if (!amount || Number(amount) <= 0) return setError("Please enter a valid amount.");
    if (!utrNumber.trim()) return setError("Please enter the UTR / reference number.");
    if (!donorEmail.trim() && !donorMobile.trim()) return setError("Please provide at least an email or mobile number.");

    setSubmitting(true);
    try {
      const resolvedSevaName = sevaName === "Other" ? otherSevaName.trim() : sevaName;
      const res = await authFetch(`${API_URL}/donations/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim() || undefined,
          donorMobile: donorMobile.trim() || undefined,
          amount: Number(amount),
          sevaName: resolvedSevaName,
          type: resolvedSevaName,
          utrNumber: utrNumber.trim(),
          manualPaymentMode: paymentMode,
          paymentDate,
          manualEntryNote: note.trim() || undefined,
          panNumber: want80G ? panNumber.trim() : undefined,
          certificate: want80G,
          wantPrasadam,
          prasadamAddress: wantPrasadam ? address : undefined,
          sevakName: sevakName.trim() || undefined,
          dob: dob || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record donation");

      setResult({
        receiptNumber: data.donation?.receiptNumber,
        dccSyncStatus: data.donation?.dccSyncStatus,
        whatsappSent: !!data.donation?.whatsappReceiptSentAt,
      });
      resetNewForm();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!selected) return setError("Please select a pending donation first.");
    if (!utrNumber.trim()) return setError("Please enter the UTR / reference number.");

    setSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/donations/${selected._id}/manual-complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          utrNumber: utrNumber.trim(),
          manualPaymentMode: paymentMode,
          manualEntryNote: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete donation");

      setResult({
        receiptNumber: data.donation?.receiptNumber,
        dccSyncStatus: data.donation?.dccSyncStatus,
        whatsappSent: !!data.donation?.whatsappReceiptSentAt,
      });
      setSelected(null);
      setMatches(null);
      setSearch("");
      resetPaymentFields();
      setPaymentMode("upi");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Manual Donation Entry</h2>
        <p className="text-sm text-muted-foreground mt-1">
          For donors who paid directly (bank transfer, UPI to our VPA, cash, cheque) with no online
          order to match, or an existing stuck donation the donor paid outside checkout.
          The UTR / reference number is used to identify the payment and prevent duplicate entry.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          className={mode === "new" ? "" : "bg-transparent border border-border text-foreground hover:bg-muted"}
          onClick={() => { setMode("new"); setResult(null); setError(null); }}
        >
          New Donation
        </Button>
        <Button
          className={mode === "existing" ? "" : "bg-transparent border border-border text-foreground hover:bg-muted"}
          onClick={() => { setMode("existing"); setResult(null); setError(null); }}
        >
          Complete an Existing Pending Donation
        </Button>
      </div>

      {result && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-5 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-green-800">Donation recorded and completed.</p>
              <p className="text-green-700 mt-1">
                Receipt: {result.receiptNumber || "syncing with DCC…"} ·{" "}
                DCC status: {result.dccSyncStatus || "pending"} ·{" "}
                WhatsApp receipt: {result.whatsappSent ? "sent" : "not sent yet (will retry, or use Resend WhatsApp from the donation detail view)"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {mode === "new" ? (
        <form onSubmit={submitNew}>
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Donor Name *</label>
                  <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Amount (₹) *</label>
                  <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1001" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-sm font-medium">Mobile</label>
                  <Input value={donorMobile} onChange={(e) => setDonorMobile(e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-sm font-medium">Seva / Purpose</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={sevaName}
                    onChange={(e) => setSevaName(e.target.value)}
                  >
                    {SEVA_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {sevaName === "Other" && (
                    <Input
                      className="mt-2"
                      value={otherSevaName}
                      onChange={(e) => setOtherSevaName(e.target.value)}
                      placeholder="Specify the seva or purpose"
                    />
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Date</label>
                  <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                </div>
              </div>

              <div className="border-t pt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Payment Mode *</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    {PAYMENT_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">UTR / Reference Number *</label>
                  <Input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} placeholder="e.g. 412345678901" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Note (internal, optional)</label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Donor called and confirmed payment" />
              </div>

              <div className="border-t pt-4 space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={want80G} onChange={(e) => setWant80G(e.target.checked)} className="h-4 w-4" />
                  <FileText className="h-4 w-4" /> Wants 80G receipt
                </label>
                {want80G && (
                  <Input value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} placeholder="PAN Number" maxLength={10} />
                )}

                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={wantPrasadam} onChange={(e) => setWantPrasadam(e.target.checked)} className="h-4 w-4" />
                  <UtensilsCrossed className="h-4 w-4" /> Wants Maha Prasadam delivery
                </label>
                {wantPrasadam && <AddressForm address={address} setAddress={setAddress} />}
              </div>

              <div className="border-t pt-4">
                <DonorExtrasFields
                  sevakName={sevakName}
                  dob={dob}
                  onSevakNameChange={setSevakName}
                  onDobChange={setDob}
                  collapsible
                />
              </div>

              <Button type="submit" disabled={submitting} className="gap-2 w-full sm:w-auto">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Record & Complete Donation
              </Button>
            </CardContent>
          </Card>
        </form>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <label className="text-sm font-medium">Search pending donations by name, email, or mobile</label>
              <div className="flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchPending())}
                  placeholder="e.g. Ramesh or 98765..."
                />
                <Button onClick={searchPending} disabled={searching} className="gap-2 shrink-0">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>

              {matches && matches.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending donations match that search.</p>
              )}

              {matches && matches.length > 0 && (
                <div className="space-y-2 pt-2">
                  {matches.map((m) => (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => setSelected(m)}
                      className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                        selected?._id === m._id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{m.donorName}</span>
                        <span className="font-bold text-primary">₹{m.amount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {m.donorEmail || m.donorMobile || "no contact"} · {m.sevaName || m.type || "-"} ·{" "}
                        {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {m.sourcePage && <> · {m.sourcePage}</>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selected && (
            <form onSubmit={submitExisting}>
              <Card className="border-primary/40">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completing donation from</p>
                      <p className="font-semibold">{selected.donorName} — ₹{selected.amount.toLocaleString("en-IN")}</p>
                    </div>
                    <Badge variant="outline">{selected.sevaName || selected.type || "General"}</Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Payment Mode *</label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        {PAYMENT_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">UTR / Reference Number *</label>
                      <Input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} placeholder="e.g. 412345678901" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Note (internal, optional)</label>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Donor confirmed via WhatsApp" />
                  </div>

                  <Button type="submit" disabled={submitting} className="gap-2 w-full sm:w-auto">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Complete This Donation
                  </Button>
                </CardContent>
              </Card>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
