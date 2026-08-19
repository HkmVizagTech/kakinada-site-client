"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, X } from "lucide-react";
import { newEventId, getMetaBrowserData, trackPurchase } from "@/lib/metaPixel";
import { captureTracking, getStoredTracking } from "@/lib/tracking";
import DonorExtrasFields from "@/components/DonorExtrasFields";

type DonationOption = {
  id: number;
  category: "ANNADAAN" | "GO SEVA";
  title: string;
  amount: number | null;
};

type CheckoutForm = {
  donorName: string;
  donorMobile: string;
  donorEmail: string;
  nationality: "Indian Citizen" | "Foreign Citizen";
  customAmount: string;
  wantPrasadam: boolean;
  want80G: boolean;
  panNumber: string;
  doorNo: string;
  building: string;
  street: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  sevakName: string;
  dob: string;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

type DonationPageSettings = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  bannerImage: string;
  bannerMobileImage: string;
  trusteeBannerImage: string;
  annadaanImage: string;
  goSevaImage: string;
  annadaanTitle: string;
  annadaanDescription: string;
  goSevaTitle: string;
  goSevaDescription: string;
  donationOptions: DonationOption[];
  galleryImages: string[];
  impactItems: Array<{ title: string; text: string }>;
  bankDetails: {
    beneficiaryName: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };
  contact: {
    phone: string;
    email: string;
    note: string;
  };
};

const defaultDonationOptions: DonationOption[] = [
  { id: 11, category: "ANNADAAN", title: "Feed 50 people", amount: 1501 },
  { id: 1, category: "ANNADAAN", title: "Feed 100 people", amount: 3001 },
  { id: 2, category: "ANNADAAN", title: "Feed 200 people", amount: 6001 },
  { id: 3, category: "ANNADAAN", title: "Feed 300 people", amount: 9001 },
  { id: 4, category: "ANNADAAN", title: "Feed 500 people", amount: 15001 },
  { id: 5, category: "ANNADAAN", title: "Feed 1000 people", amount: 30001 },
  { id: 6, category: "ANNADAAN", title: "Feed 2000 people", amount: 60001 },
  { id: 7, category: "ANNADAAN", title: "Feed 3000 people", amount: 90001 },
  { id: 8, category: "ANNADAAN", title: "Feed 5000 people", amount: 150000 },
  { id: 9, category: "ANNADAAN", title: "Feed 10,000 people", amount: 300000 },
  { id: 10, category: "ANNADAAN", title: "Donate any other Amount", amount: null },
  { id: 21, category: "GO SEVA", title: "Feed 10 Cows For A Day", amount: 1500 },
  { id: 12, category: "GO SEVA", title: "Medicines For Cow", amount: 2500 },
  { id: 13, category: "GO SEVA", title: "Feed A Cow For A Month", amount: 3500 },
  { id: 14, category: "GO SEVA", title: "Feed 5 Cows For A Week", amount: 5000 },
  { id: 15, category: "GO SEVA", title: "Green Grass For All Cows For A Day", amount: 9000 },
  { id: 16, category: "GO SEVA", title: "Fodder For All Cows For A Day", amount: 15000 },
  { id: 17, category: "GO SEVA", title: "Adopt A Cow For An Year", amount: 40000 },
  { id: 18, category: "GO SEVA", title: "Adopt 3 Cows For An Year", amount: 120000 },
  { id: 19, category: "GO SEVA", title: "Adopt 5 Cows For An Year", amount: 200000 },
  { id: 20, category: "GO SEVA", title: "Donate any other Amount", amount: null },
];

const initialForm: CheckoutForm = {
  donorName: "",
  donorMobile: "",
  donorEmail: "",
  nationality: "Indian Citizen",
  customAmount: "",
  wantPrasadam: false,
  want80G: false,
  panNumber: "",
  doorNo: "",
  building: "",
  street: "",
  area: "",
  pincode: "",
  city: "",
  state: "",
  sevakName: "",
  dob: "",
};

const formatAmount = (amount: number) => amount.toLocaleString("en-IN");

const apiBase = () => (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const defaultSettings: DonationPageSettings = {
  heroEyebrow: "Hare Krishna Movement Vizag",
  heroTitle: "Donate Annadaan and Gau Seva Online",
  heroSubtitle: "Support Narasimha Jayanthi meals for hungry and needy people.",
  bannerImage: "/assets/donations-nsj-annadan-web.jpeg",
  bannerMobileImage: "/assets/donations-nsj-annadan-mobile.jpeg",
  trusteeBannerImage: "/assets/donations-trustee-banner.png",
  annadaanImage: "/assets/donations-annadana-real.jpg",
  goSevaImage: "/assets/donations-gau-seva-real.jpeg",
  annadaanTitle: "Annadaan Seva",
  annadaanDescription: "Choose the number of people you would like to feed. Each offering supports prasadam distribution and community service.",
  goSevaTitle: "Gau Seva",
  goSevaDescription: "Support daily care for cows through food, medicines, green grass and yearly adoption sevas.",
  donationOptions: defaultDonationOptions,
  galleryImages: [
    "/assets/donations-service-activity-1.png",
    "/assets/donations-service-activity-2.png",
    "/assets/donations-service-activity-3.png",
    "/assets/donations-service-activity-4.png",
  ],
  impactItems: [
    { title: "Daily prasadam", text: "Offer food with dignity, devotion and care." },
    { title: "Protected cow care", text: "Support fodder, grass and medical needs." },
    { title: "Secure checkout", text: "Razorpay payment with receipt-ready donor details." },
  ],
  bankDetails: {
    beneficiaryName: "HARE KRISHNA MOVEMENT INDIA",
    bankName: "IDFC FIRST BANK LTD",
    accountNumber: "10091415313",
    ifsc: "IDFB0080412",
  },
  contact: {
    phone: "89777 61187",
    email: "mukunda@hkmvizag.org",
    note: "Gentle Request! While doing Paytm/UPI App Payments or Bank (NEFT/RTGS), please send us a screenshot along with complete address and PAN details.",
  },
};

const loadRazorpay = () =>
  new Promise<void>((resolve, reject) => {
    const win = window as unknown as { Razorpay?: RazorpayConstructor };
    if (win.Razorpay) return resolve();

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Razorpay")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay"));
    document.body.appendChild(script);
  });

export default function DonationsClient() {
  const [selected, setSelected] = useState<DonationOption | null>(null);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [status, setStatus] = useState<{ type: "success" | "error" | "idle"; message: string }>({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<DonationPageSettings>(defaultSettings);
  // Donors can adjust a card's suggested amount before donating — keyed by
  // option.id so each card's edit is independent of the others.
  const [cardAmounts, setCardAmounts] = useState<Record<number, string>>({});

  const donationOptions = settings.donationOptions.length ? settings.donationOptions : defaultDonationOptions;
  const annadaan = donationOptions.filter((option) => option.category === "ANNADAAN");
  const goSeva = donationOptions.filter((option) => option.category === "GO SEVA");
  const finalAmount = selected?.amount ?? Number(form.customAmount || 0);
  const showTaxField = finalAmount >= 500;
  const showPrasadamField = finalAmount >= 1000;
  const needsAddress = form.want80G || form.wantPrasadam;
  const phoneDigits = settings.contact.phone.replace(/\D/g, "");
  const phoneHref = phoneDigits.startsWith("91") ? `+${phoneDigits}` : `+91${phoneDigits}`;
  const galleryImages = settings.galleryImages.length ? settings.galleryImages : defaultSettings.galleryImages;

  const selectedSummary = useMemo(() => {
    if (!selected) return "";
    return `${selected.category} - ${selected.title}`;
  }, [selected]);

  useEffect(() => {
    // Capture UTM/referrer data once on mount so it's ready by the time
    // the donor submits — attached to the order request below.
    captureTracking();
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${apiBase()}/donation-page`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.page) return;
        setSettings({
          ...defaultSettings,
          ...data.page,
          bankDetails: { ...defaultSettings.bankDetails, ...(data.page.bankDetails || {}) },
          contact: { ...defaultSettings.contact, ...(data.page.contact || {}) },
          impactItems: Array.isArray(data.page.impactItems) && data.page.impactItems.length ? data.page.impactItems : defaultSettings.impactItems,
          donationOptions: Array.isArray(data.page.donationOptions) && data.page.donationOptions.length ? data.page.donationOptions : defaultDonationOptions,
          galleryImages: Array.isArray(data.page.galleryImages) && data.page.galleryImages.length ? data.page.galleryImages : defaultSettings.galleryImages,
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const openCheckout = (option: DonationOption) => {
    const editedAmount = option.amount ? Number(cardAmounts[option.id]) : null;
    const finalOption = editedAmount && editedAmount > 0 ? { ...option, amount: editedAmount } : option;
    setSelected(finalOption);
    setForm(initialForm);
    setStatus({ type: "idle", message: "" });
  };

  const closeCheckout = () => {
    if (!submitting) setSelected(null);
  };

  const updateForm = (patch: Partial<CheckoutForm>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const validate = () => {
    if (!selected) return "Please select a seva.";
    if (!finalAmount || finalAmount < 100) return "Amount must be at least ₹100.";
    if (!form.donorName.trim()) return "Donor name is required.";
    if (!/^[6-9]\d{9}$/.test(form.donorMobile)) return "Please enter a valid 10 digit mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donorEmail)) return "Please enter a valid email address.";
    if (form.want80G && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber)) return "Please enter a valid PAN number.";
    if (needsAddress) {
      if (!form.area.trim() || !form.pincode.trim() || !form.city.trim() || !form.state.trim()) {
        return "Please fill address, pincode, city and state.";
      }
      if (!/^\d{6}$/.test(form.pincode)) return "Please enter a valid 6 digit pincode.";
    }
    return "";
  };

  const submitDonation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    if (!selected) return;
    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const metaEventId = newEventId();
      const metaBrowser = getMetaBrowserData();
      const orderResponse = await fetch(`${apiBase()}/payments/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: "donations",
          sourcePage: "donations",
          site: "kakinada",
          type: selected.category,
          sevaName: selected.title,
          name: form.donorName.trim(),
          email: form.donorEmail.trim().toLowerCase(),
          mobile: form.donorMobile,
          amount: finalAmount,
          sevakName: form.sevakName.trim() || undefined,
          dob: form.dob || undefined,
          certificate: form.want80G,
          panNumber: form.want80G ? form.panNumber : undefined,
          mahaprasadam: form.wantPrasadam,
          utm: getStoredTracking() || undefined,
          metaEventId,
          metaFbp: metaBrowser.fbp,
          metaFbc: metaBrowser.fbc,
          prasadamAddress: needsAddress
            ? {
                doorNo: form.doorNo,
                house: form.building,
                street: form.street,
                area: form.area,
                country: "India",
                state: form.state,
                city: form.city,
                pincode: form.pincode,
              }
            : null,
        }),
      });

      if (!orderResponse.ok) throw new Error("Unable to create payment order.");
      const order = await orderResponse.json();
      await loadRazorpay();

      const win = window as unknown as { Razorpay?: RazorpayConstructor };
      if (!win.Razorpay) throw new Error("Razorpay checkout is unavailable.");

      new win.Razorpay({
        key: order.key,
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        name: "Hare Krishna Movement Kakinada",
        description: selectedSummary,
        order_id: order.orderId,
        prefill: {
          name: form.donorName,
          email: form.donorEmail,
          contact: form.donorMobile,
        },
        notes: {
          sourcePage: "donations",
          sevaId: selected.id,
          sevaName: selected.title,
          sevaType: selected.category,
          nationality: form.nationality,
        },
        handler: async (response: Record<string, string>) => {
          try {
            const verifyResponse = await fetch(`${apiBase()}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                donationId: order.donationId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) throw new Error("Payment verification failed.");
            trackPurchase({ value: finalAmount, eventId: metaEventId, content_name: selected.title });
            window.location.assign(`/payment/thank-you?type=donation&seva=${encodeURIComponent(selected?.title || "donation")}&amount=${finalAmount}&source=${encodeURIComponent("our donation programmes")}`);
            setSelected(null);
          } catch (verifyError) {
            setStatus({
              type: "error",
              message: verifyError instanceof Error ? verifyError.message : "Payment verification failed.",
            });
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
        theme: {
          color: "#0f3b82",
        },
      }).open();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Donation could not be completed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderOptions = (options: DonationOption[], kind: "annadaan" | "gau") => (
    <div className="donation-grid">
      {options.map((option) => {
        const isCustom = !option.amount;
        return (
        <article
          key={option.id}
          className={`donation-card-exact ${isCustom ? "donation-card-full " : ""}${kind === "annadaan" ? "donation-card-annadaan" : "donation-card-gau"}`}
        >
          <div className="donation-card-head">
            <div className={`seva-icon ${kind === "annadaan" ? "seva-icon-annadaan" : "seva-icon-gau"}`} aria-hidden="true">
              <span className={kind === "annadaan" ? "plate-icon" : "cow-icon"}>{kind === "annadaan" ? "A" : "G"}</span>
            </div>
          </div>
          <h3>{option.title}</h3>
          <div className={`donation-card-row ${isCustom ? "single" : ""}`}>
            {!isCustom && (
              <div className={`donation-amount ${kind === "annadaan" ? "donation-amount-annadaan" : "donation-amount-gau"}`}>
                <span className="donation-amount-inner">
                  <span className="donation-amount-symbol">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="donation-amount-input"
                    value={cardAmounts[option.id] ?? String(option.amount)}
                    size={Math.max(4, String(cardAmounts[option.id] ?? option.amount).length)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setCardAmounts((prev) => ({ ...prev, [option.id]: e.target.value }))}
                    aria-label={`Amount for ${option.title}`}
                  />
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => openCheckout(option)}
              className={`donate-button ${kind === "annadaan" ? "donate-button-annadaan" : "donate-button-gau"}`}
            >
              DONATE NOW
            </button>
          </div>
        </article>
        );
      })}
    </div>
  );

  return (
    <>
      <main className="exact-page" id="top">
        {/* Floating WhatsApp contact — this page is intentionally a
            distraction-free checkout flow without the full site nav, so a
            quick way to ask a question stays available. */}
        <a
          href="https://wa.me/919063020108"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevated transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 32 32" className="h-8 w-8" fill="currentColor" aria-hidden>
            <path d="M16.004 0C7.163 0 0 7.163 0 16c0 2.82.737 5.566 2.137 7.98L0 32l8.223-2.113A15.9 15.9 0 0 0 16.004 32C24.84 32 32 24.837 32 16S24.84 0 16.004 0Zm0 29.09a13.03 13.03 0 0 1-6.643-1.82l-.477-.283-4.878 1.253 1.303-4.755-.31-.488a13.06 13.06 0 0 1-2.005-6.997c0-7.226 5.879-13.106 13.014-13.106 3.477 0 6.745 1.355 9.202 3.815a12.94 12.94 0 0 1 3.808 9.204c0 7.226-5.879 13.177-13.014 13.177Zm7.13-9.78c-.39-.196-2.302-1.137-2.66-1.266-.357-.13-.617-.196-.877.196-.26.39-1.006 1.266-1.234 1.526-.227.26-.454.293-.844.098-.39-.196-1.647-.607-3.137-1.936-1.16-1.034-1.943-2.312-2.171-2.702-.227-.39-.024-.6.172-.795.176-.176.39-.454.585-.682.195-.227.26-.39.39-.65.13-.26.065-.487-.033-.682-.098-.196-.877-2.113-1.202-2.893-.316-.759-.638-.656-.877-.668-.227-.01-.487-.012-.747-.012-.26 0-.682.098-1.04.487-.357.39-1.364 1.333-1.364 3.25 0 1.917 1.397 3.77 1.592 4.03.195.26 2.75 4.2 6.663 5.888.931.402 1.658.642 2.225.822.935.298 1.786.256 2.459.155.75-.112 2.302-.941 2.627-1.85.325-.909.325-1.688.227-1.85-.098-.163-.357-.26-.747-.455Z" />
          </svg>
        </a>
        <section className="hero-slider">
          <div className="container-hero">
            <div className="carousel-shell carousel-fallback">
              <a href="#annadaan" className="carousel-slide">
                <picture>
                  <source media="(max-width: 640px)" srcSet={settings.bannerMobileImage || settings.bannerImage} />
                  <img src={settings.bannerImage} alt="Narasimha Jayanthi Annadaan donation banner for ISKCON Charity Vizag" className="carousel-image" />
                </picture>
              </a>
            </div>
          </div>
        </section>

        <section className="headline-wrap container-narrow">
          <div className="headline-block">
            <h1>{settings.heroTitle}</h1>
            <h2>{settings.heroSubtitle}</h2>
          </div>
          <div className="headline-actions">
            <a href="#annadaan" className="cta-yellow">ANNADAAN</a>
            <a href="#goseva" className="cta-green">GO SEVA</a>
          </div>
        </section>

        <section className="blue-banner">
          <div className="container-narrow blue-banner-inner">
            <img src={settings.trusteeBannerImage} alt="Festival trustee banner" />
          </div>
        </section>

        <section className="donation-section container-wide">
          <div className="headline-block thanks">
            <h2>We are thankful for your kind gesture!</h2>
          </div>
          <div className="section-title-wrap">
            <h2 className="section-title annadaan-title" id="annadaan">{settings.annadaanTitle.toUpperCase()}</h2>
          </div>
          {renderOptions(annadaan, "annadaan")}
          <div className="section-title-wrap">
            <h2 className="section-title goseva-title" id="goseva">{settings.goSevaTitle.toUpperCase()}</h2>
          </div>
          {renderOptions(goSeva, "gau")}
        </section>

        <section className="black-strip">
          <div className="container-wide">
            <p>
              {settings.contact.note} on our Whatsapp Number{" "}
              <a href={`tel:${phoneHref}`}>+91 {settings.contact.phone}</a> or to our mail ID{" "}
              <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>. You may also call on this number for other queries.
            </p>
          </div>
        </section>

        <section className="bank-section container-wide">
          <div className="bank-box">
            <h4>Donation Through Bank (NEFT/ RTGS)</h4>
            <p>
              Beneficiary Name : {settings.bankDetails.beneficiaryName}<br />
              Bank Name: {settings.bankDetails.bankName}<br />
              A/c No: {settings.bankDetails.accountNumber}<br />
              IFSC code: {settings.bankDetails.ifsc}
            </p>
          </div>
        </section>

        <section className="gallery-section container-wide">
          <div className="gallery-grid">
            {galleryImages.slice(0, 4).map((src, index) => (
              <figure key={`${src}-${index}`} className="gallery-tile">
                <img
                  src={src}
                  alt={[
                    "Supporters of Hare Krishna Movement Vizag charity seva",
                    "Well-wishers supporting Annadaan and Gau Seva donations",
                    "Daily Annadaan food distribution service in Visakhapatnam",
                    "Children receiving Annadaan meal support",
                  ][index] || "Hare Krishna charity seva"}
                  loading="lazy"
                  decoding="async"
                  className={`gallery-image gallery-image-${index + 1}`}
                />
              </figure>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <div className="footer-grid container-wide">
            <div>
              <h3>ABOUT US</h3>
              <p>We are trying to give human society an opportunity for a life of happiness, good health, peace of mind and all good qualities through God Consciousness.</p>
              <h3>SOCIAL CONNECT</h3>
              <div className="social-links">
                <a href="https://www.facebook.com/hkm.vizag" target="_blank" rel="noreferrer">Facebook</a>
                <a href="https://www.youtube.com/user/harekrishnavizag" target="_blank" rel="noreferrer">YouTube</a>
                <a href="https://www.instagram.com/harekrishnavizag/" target="_blank" rel="noreferrer">Instagram</a>
              </div>
            </div>
            <div>
              <h3>ADDRESS</h3>
              <p>
                <strong>Sri Radha Madan Mohan Mandir</strong><br />
                Hare Krishna Movement<br />
                IIM Rd, opp. Akshaya Patra Foundation,<br />
                Gambhiram,<br />
                Visakhapatnam,<br />
                Andhra Pradesh 531163
              </p>
            </div>
            <div>
              <h3>CONTACT INFO</h3>
              <ul className="footer-links">
                <li><a href={`tel:${phoneHref}`}>{settings.contact.phone}</a></li>
                <li><a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a></li>
                <li><a href={`https://wa.me/${phoneHref.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp {settings.contact.phone}</a></li>
              </ul>
            </div>
          </div>
          <div className="copyright-row">
            <div className="container-wide copyright-inner">
              <p>Copyright &copy; 2026 Hare Krishna Movement India.</p>
            </div>
          </div>
        </footer>
      </main>

      {status.message && !selected && (
        <div className={`fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg px-5 py-3 text-sm font-semibold shadow-lg ${
          status.type === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"
        }`}>
          {status.message}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-background shadow-elevated">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Donation Checkout</p>
                <h2 className="text-xl font-bold text-foreground">{selected.title}</h2>
              </div>
              <button type="button" onClick={closeCheckout} className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitDonation} className="space-y-5 p-6">
              <div className="grid gap-4 rounded-lg bg-muted p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Seva Name</p>
                  <p className="mt-1 font-bold text-foreground">{selected.title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Seva Type</p>
                  <p className="mt-1 font-bold text-foreground">{selected.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Seva Amount</p>
                  <p className="mt-1 font-bold text-foreground">
                    {selected.amount ? `₹${formatAmount(selected.amount)}` : "Enter amount"}
                  </p>
                </div>
              </div>

              {!selected.amount && (
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Enter Seva Amount *</span>
                  <Input
                    type="number"
                    min={100}
                    value={form.customAmount}
                    onChange={(event) => updateForm({ customAmount: event.target.value, want80G: false, wantPrasadam: false })}
                    placeholder="Enter amount"
                    className="mt-2"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">Amount must be at least ₹100.</span>
                </label>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Donor Name *</span>
                  <Input value={form.donorName} maxLength={39} onChange={(event) => updateForm({ donorName: event.target.value.replace(/[^a-zA-Z ]/g, "") })} placeholder="Your Name" className="mt-2" />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Mobile Number *</span>
                  <Input value={form.donorMobile} maxLength={10} onChange={(event) => updateForm({ donorMobile: event.target.value.replace(/\D/g, "") })} placeholder="Your Mobile Number" className="mt-2" />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-foreground">E-Mail ID *</span>
                  <Input type="email" value={form.donorEmail} onChange={(event) => updateForm({ donorEmail: event.target.value.toLowerCase() })} placeholder="Your Email" className="mt-2" />
                </label>
              </div>

              <DonorExtrasFields
                sevakName={form.sevakName}
                dob={form.dob}
                onSevakNameChange={(v) => updateForm({ sevakName: v })}
                onDobChange={(v) => updateForm({ dob: v })}
              />

              <fieldset className="rounded-lg border border-border p-4">
                <legend className="px-2 text-sm font-semibold text-foreground">Payment Option *</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {(["Indian Citizen", "Foreign Citizen"] as const).map((value) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-foreground">
                      <input type="radio" checked={form.nationality === value} onChange={() => updateForm({ nationality: value })} />
                      {value}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-3">
                {showPrasadamField && (
                  <label className="flex items-start gap-3 rounded-lg border border-border p-4 text-sm text-foreground">
                    <input type="checkbox" checked={form.wantPrasadam} onChange={(event) => updateForm({ wantPrasadam: event.target.checked })} className="mt-1" />
                    I would like to receive Maha Prasadam (Only within India)
                  </label>
                )}
                {showTaxField && (
                  <label className="flex items-start gap-3 rounded-lg border border-border p-4 text-sm text-foreground">
                    <input type="checkbox" checked={form.want80G} onChange={(event) => updateForm({ want80G: event.target.checked })} className="mt-1" />
                    <span>
                      I wish to receive 80G Tax Exemption
                      <span className="mt-1 block text-xs text-muted-foreground">PAN and address are mandatory when 80G is selected.</span>
                    </span>
                  </label>
                )}
              </div>

              {form.want80G && (
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">PAN Number *</span>
                  <Input value={form.panNumber} maxLength={10} onChange={(event) => updateForm({ panNumber: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} placeholder="Eg: ABCDE1234F" className="mt-2" />
                </label>
              )}

              {needsAddress && (
                <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">House No/Door No</span>
                    <Input value={form.doorNo} maxLength={39} onChange={(event) => updateForm({ doorNo: event.target.value })} className="mt-2" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">House/Apartment/Building Name</span>
                    <Input value={form.building} maxLength={39} onChange={(event) => updateForm({ building: event.target.value })} className="mt-2" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">Street Name</span>
                    <Input value={form.street} maxLength={39} onChange={(event) => updateForm({ street: event.target.value })} className="mt-2" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">Location/Area *</span>
                    <Input value={form.area} maxLength={39} onChange={(event) => updateForm({ area: event.target.value })} className="mt-2" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">PIN Code *</span>
                    <Input value={form.pincode} maxLength={6} onChange={(event) => updateForm({ pincode: event.target.value.replace(/\D/g, "") })} className="mt-2" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">City *</span>
                    <Input value={form.city} maxLength={30} onChange={(event) => updateForm({ city: event.target.value.toUpperCase().replace(/[^A-Z ]/g, "") })} className="mt-2" />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-semibold text-foreground">State *</span>
                    <Input value={form.state} maxLength={30} onChange={(event) => updateForm({ state: event.target.value.toUpperCase().replace(/[^A-Z ]/g, "") })} className="mt-2" />
                  </label>
                </div>
              )}

              {status.type === "error" && <p className="rounded-lg bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">{status.message}</p>}

              <Button type="submit" disabled={submitting} className="w-full bg-amber-500 py-6 text-base font-bold text-amber-950 hover:bg-amber-400">
                <Heart className="mr-2 h-5 w-5 fill-current" />
                {submitting ? "Opening Checkout..." : `Donate ₹${formatAmount(finalAmount || 0)}`}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
