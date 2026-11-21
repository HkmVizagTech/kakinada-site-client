"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { COLLEGE_YEARS } from "@/lib/vanabhojanam/config";
import { registrationApi } from "@/lib/vanabhojanam/api";
import { formatINR } from "@/lib/vanabhojanam/format";
import { preloadRazorpay, isInAppBrowser } from "@/lib/vanabhojanam/razorpay";
import { buildPayload, feeFor } from "@/lib/vanabhojanam/validation";
import type { PresentedEvent } from "@/lib/vanabhojanam/event";
import { cn } from "@/lib/utils";
import { VbButton } from "../ui/Button";
import { FormField, VbInput, VbInputGroup, VbSelect } from "../ui/Fields";
import { VbAlert } from "../ui/Feedback";
import { useCurrentEvent } from "../context/CurrentEventContext";
import Figure from "./Figure";
import { usePayment, useRegistrationForm } from "./useRegistration";

/** Pick a college from the list, or type any name: it is used exactly as typed. */
function CollegeCombobox({ id, value, options, onChange, invalid }: { id: string; value: string; options: string[]; onChange: (value: string) => void; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const typed = query.trim();
  const matches = useMemo(() => {
    const q = typed.toLowerCase();
    return (q ? options.filter((o) => o.toLowerCase().includes(q)) : options).slice(0, 60);
  }, [options, typed]);
  const exact = options.some((o) => o.toLowerCase() === typed.toLowerCase());
  const canCreate = typed.length > 1 && !exact;

  const pick = (name: string) => {
    onChange(name);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <VbInput
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          invalid={invalid}
          placeholder="Select your college, or type its name"
          value={open ? query : value}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (matches[0] && !canCreate) pick(matches[0]);
              else if (canCreate) pick(typed);
            }
            if (e.key === "Escape") setOpen(false);
          }}
          className="pr-16"
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-1 text-gray-400">
          {value && (
            <button type="button" aria-label="Clear college" className="rounded p-1 hover:bg-black/5 hover:text-gray-700" onClick={() => pick("")}>
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {open && (
        <ul role="listbox" className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-black/10 bg-white py-1 shadow-lg">
          {canCreate && (
            <li role="option" aria-selected={false}>
              <button type="button" className="w-full px-3 py-2 text-left text-sm font-semibold text-vb-brand-700 hover:bg-vb-brand-50" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(typed)}>
                Use &quot;{typed}&quot;
              </button>
            </li>
          )}
          {matches.map((name) => (
            <li key={name} role="option" aria-selected={name === value}>
              <button
                type="button"
                className={cn("flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-vb-brand-50", name === value ? "bg-vb-brand-600 text-white hover:bg-vb-brand-600" : "text-vb-brand-700")}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(name)}
              >
                {name}
                {name === value && <Check className="h-4 w-4" />}
              </button>
            </li>
          ))}
          {!matches.length && !canCreate && <li className="px-3 py-2 text-sm text-gray-500">Type your college name</li>}
        </ul>
      )}
    </div>
  );
}

function FeeBanner({ event, category }: { event: PresentedEvent; category: string }) {
  const fee = feeFor(event, category);
  const info = (event.fees as any)[category];
  return (
    <div aria-live="polite" className="flex items-center justify-between gap-3 rounded-xl border border-vb-brass-200 bg-vb-brass-50 px-4 py-3 text-vb-brand-800">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider">Registration fee</p>
        {!event.sameFee && <p className="text-sm">{info ? info.label : "Choose student or working below"}</p>}
      </div>
      <p className="whitespace-nowrap font-vb-heading text-2xl font-bold leading-none md:text-3xl">
        {fee || event.sameFee ? formatINR(fee ?? event.fees.College.amount) : `${formatINR(event.fees.College.amount)} / ${formatINR(event.fees.Working.amount)}`}
      </p>
    </div>
  );
}

export default function RegistrationForm() {
  const { event } = useCurrentEvent();
  const { values, errors, setField, idCard, pickIdCard, clearIdCard, validate } = useRegistrationForm();
  const { pay, isPaying } = usePayment();
  const [colleges, setColleges] = useState<string[]>([]);
  const [inApp, setInApp] = useState(false);

  useEffect(() => setInApp(isInAppBrowser()), []);

  useEffect(() => {
    const controller = new AbortController();
    registrationApi
      .getColleges(controller.signal)
      .then((list) => setColleges(list.map((c: any) => c.name)))
      .catch((err) => {
        if (!controller.signal.aborted) console.error("Failed to fetch colleges:", err);
      });
    return () => controller.abort();
  }, []);

  // When the edition is open to one group only, that choice is made for the visitor.
  const only = event?.audience === "students" ? "College" : event?.audience === "working" ? "Working" : "";
  useEffect(() => {
    if (only && values.collegeOrWorking !== only) setField("collegeOrWorking", only);
  }, [only, values.collegeOrWorking, setField]);

  if (!event) return null;

  const isCollege = values.collegeOrWorking === "College";
  const isWorking = values.collegeOrWorking === "Working";
  const today = new Date().toISOString().split("T")[0];

  const text = (name: keyof typeof values) => ({
    value: values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField(name, e.target.value),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    pay({ payload: buildPayload(values), studentIdCard: isCollege ? idCard.file : null });
  };

  const cta = isCollege
    ? `Register Now for ${formatINR(feeFor(event, "College"))} (Student)`
    : isWorking
      ? `Register Now for ${formatINR(feeFor(event, "Working"))} (Professional)`
      : "Register Now";

  return (
    <div id="register" className="scroll-mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-vb-lift">
      <div
        className="flex items-center justify-between gap-2 border-b-2 border-vb-brass-400 bg-vb-night py-3 pl-5 pr-1 text-white md:py-4 md:pl-8 md:pr-4"
        style={{ backgroundImage: "radial-gradient(ellipse 60% 120% at 88% 50%, rgba(201,162,74,0.28), transparent 70%)" }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-vb-brass-300">Your entry pass</p>
          <h3 className="mt-1 font-vb-heading text-2xl font-semibold leading-[1.1] text-white md:text-3xl">{event.name} Registration</h3>
          <p className="mt-2 max-w-[260px] text-sm text-white/80">Pay once and your QR pass arrives on WhatsApp.</p>
        </div>
        <Figure name="pass" label="Illustration of a QR entry pass" className="h-[130px] w-[120px] shrink-0 md:h-[170px] md:w-[160px]" />
      </div>

      <div className="p-5 pt-5 md:p-6">
        <p className="mb-4 text-xs text-gray-600">
          <span className="text-red-500">*</span> indicates required
        </p>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <FeeBanner event={event} category={values.collegeOrWorking} />

          <FormField id="name" label="Name" required error={errors.name}>
            <VbInput id="name" placeholder="Your full name" autoComplete="name" invalid={!!errors.name} {...text("name")} />
          </FormField>

          <FormField id="dob" label="Date of Birth" required error={errors.dob}>
            <VbInput id="dob" type="date" max={today} invalid={!!errors.dob} {...text("dob")} />
          </FormField>

          <FormField id="whatsappNumber" label="WhatsApp Number" required error={errors.whatsappNumber}>
            <VbInputGroup prefix="+91">
              <VbInput id="whatsappNumber" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Your WhatsApp number" invalid={!!errors.whatsappNumber} {...text("whatsappNumber")} />
            </VbInputGroup>
          </FormField>

          <FormField id="email" label="Email" required error={errors.email}>
            <VbInput id="email" type="email" autoComplete="email" placeholder="your.email@example.com" invalid={!!errors.email} {...text("email")} />
          </FormField>

          <FormField id="area" label="Area" required error={errors.area}>
            <VbInput id="area" placeholder="Where you live, e.g. Jagannaickpur, Ramanayyapeta" autoComplete="address-level3" invalid={!!errors.area} {...text("area")} />
          </FormField>

          <FormField id="gender" label="Gender" required error={errors.gender}>
            <div role="radiogroup" className="flex gap-6">
              {["Male", "Female"].map((g) => (
                <label key={g} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={values.gender === g}
                    onChange={() => setField("gender", g)}
                    className="h-4 w-4 accent-[#1f5a3d]"
                  />
                  {g}
                </label>
              ))}
            </div>
          </FormField>

          {only ? (
            <VbAlert status="info" title={only === "College" ? "Open to students only" : "Open to working professionals only"}>
              {only === "College" ? "Please carry your student ID card to the event for verification." : "This edition is for working professionals."}
            </VbAlert>
          ) : (
            <FormField id="collegeOrWorking" label="Are you a Student or Working?" required error={errors.collegeOrWorking}>
              <VbSelect id="collegeOrWorking" invalid={!!errors.collegeOrWorking} {...text("collegeOrWorking")}>
                <option value="">--Select--</option>
                <option value="College">Student</option>
                <option value="Working">Working</option>
              </VbSelect>
              {isCollege && (
                <VbAlert status="success" className="mt-2">
                  Please carry your student ID card to the event for verification.
                  {!event.sameFee && (
                    <>
                      {" "}Student rate: <b>{formatINR(feeFor(event, "College"))}</b>
                    </>
                  )}
                </VbAlert>
              )}
              {isWorking && !event.sameFee && (
                <VbAlert status="warning" className="mt-2">
                  Registration fee for working professionals: <b>{formatINR(feeFor(event, "Working"))}</b>
                </VbAlert>
              )}
            </FormField>
          )}

          {isWorking && (
            <FormField id="companyName" label="Company Name" required error={errors.companyName}>
              <VbInput id="companyName" placeholder="Your company name" autoComplete="organization" invalid={!!errors.companyName} {...text("companyName")} />
            </FormField>
          )}

          {isCollege && (
            <>
              <FormField id="college" label="College Name" required error={errors.college} hint='Not in the list? Just type your college name and choose "Use ...".'>
                <CollegeCombobox id="college" value={values.college} options={colleges} onChange={(v) => setField("college", v)} invalid={!!errors.college} />
              </FormField>

              <FormField id="course" label="Course" required error={errors.course}>
                <VbInput id="course" placeholder="e.g., B.Tech, MBA" invalid={!!errors.course} {...text("course")} />
              </FormField>

              <FormField id="year" label="Year" required error={errors.year}>
                <VbSelect id="year" invalid={!!errors.year} {...text("year")}>
                  <option value="">--Select Year--</option>
                  {COLLEGE_YEARS.map((y) => (
                    <option key={y.value} value={y.value}>
                      {y.label}
                    </option>
                  ))}
                </VbSelect>
              </FormField>

              <FormField
                id="studentIdCard"
                label="Student ID Card"
                required
                error={errors.studentIdCard}
                hint="A clear photo of your student ID card. Our team verifies it before your QR is sent. JPG, PNG or WebP, max 5MB."
              >
                <input
                  id="studentIdCard"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    pickIdCard(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white p-1 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-vb-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-vb-brand-700 hover:file:bg-vb-brand-100"
                />
                {idCard.previewUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={idCard.previewUrl} alt="ID card preview" className="max-h-[120px] max-w-[200px] rounded-md border object-cover" />
                    <VbButton size="sm" variant="dangerOutline" onClick={clearIdCard}>
                      Remove
                    </VbButton>
                  </div>
                )}
              </FormField>
            </>
          )}

          <VbButton type="submit" variant="festival" size="lg" className="h-[3.75rem] w-full" loading={isPaying} loadingText="Processing" onMouseEnter={preloadRazorpay} onFocus={preloadRazorpay}>
            {cta}
          </VbButton>
          {inApp && (
            <VbAlert status="warning">
              <b>For UPI to work, open this page in Chrome or Safari.</b> The browser inside WhatsApp or Instagram often cannot open your UPI app. Tap the menu (⋮ or ⋯) and choose &quot;Open in browser&quot;.
            </VbAlert>
          )}
          <p className="text-center text-sm text-gray-600">
            Secure payment via Razorpay. Keep this page open while you approve the payment in your UPI app. Your QR pass is sent to your WhatsApp number.
          </p>
        </form>
      </div>
    </div>
  );
}
