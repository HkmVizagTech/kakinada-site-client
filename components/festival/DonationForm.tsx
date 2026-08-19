"use client";
import { useState } from "react";
import { useAttribution } from "@/lib/useAttribution";
import { useRazorpayPreload } from "@/lib/useRazorpayPreload";
import DonorExtrasFields from "@/components/DonorExtrasFields";

const fmt = (n: number) => Number(n).toLocaleString("en-IN");

const DEFAULT_SEVA_OPTIONS = [
  { id: "rama-taraka",   name: "Rama Taraka Yajna",      amounts: [10001, 5001, 2501, 1001] },
  { id: "panaka",        name: "Panaka Kosambari Seva",   amounts: [15000, 10000, 5000, 2500] },
  { id: "pushpalankara", name: "Pushpalankara Seva",      amounts: [10001, 5001, 2501, 1001] },
  { id: "vastra",        name: "Vastra Abharana Seva",    amounts: [25000, 20000, 10000, 5000] },
  { id: "annadana",      name: "Annadana Seva",           amounts: [10001, 5001, 2501, 1001] },
  { id: "naivedya",      name: "Vishesha Naivedya Seva",  amounts: [15000, 10000, 5000, 2500] },
];

export default function DonationForm({ config, setToast }: any) {
  const attribution = useAttribution(config?.slug ? `/festival/${config.slug}` : "/festival");
  const razorpayReady = useRazorpayPreload();
  const [selectedSevas, setSelectedSevas] = useState<any>({});
  const [expandedSeva, setExpandedSeva] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", dob: "", sevakName: "", panNumber: "", want80G: false, wantPrasadam: false,
    doorNo: '', house: '', street: '', area: '', country: 'India', state: '', city: '', pincode: '' });

  const toggleSeva = (id: string) => setExpandedSeva(expandedSeva === id ? null : id);

  const selectAmount = (sevaId: string, amount: number) => {
  setSelectedSevas((p: any) => ({ ...p, [sevaId]: amount }));
  };


  const totalAmount = Object.values(selectedSevas).reduce((s: number, a: any) => s + (a || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmount === 0) {
      setToast({ message: "Please select at least one seva", type: "error" });
      setTimeout(() => setToast({}), 3000);
      return;
    }
    if (!formData.name || !formData.mobile) {
      setToast({ message: "Please fill in your name and phone number", type: "error" });
      setTimeout(() => setToast({}), 3000);
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setToast({ message: "Please enter a valid 10-digit mobile number", type: "error" });
      setTimeout(() => setToast({}), 3000);
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setToast({ message: "Please enter a valid email address, or leave it blank", type: "error" });
      setTimeout(() => setToast({}), 3000);
      return;
    }
    if (formData.wantPrasadam) {
      const required = ['doorNo','street','area','state','city','pincode'];
      for (const k of required) {
        if (!formData[k as keyof typeof formData] || String(formData[k as keyof typeof formData]).trim() === '') {
          setToast({ message: 'Please fill in delivery address details for Maha Prasadam', type: 'error' });
          setTimeout(() => setToast({}), 3000);
          return;
        }
      }
      formData.country = 'India';
    }
  const apiBase = ((process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || 'http://localhost:8080').replace(/\/+$/, '');
    try {
  const orderRes = await fetch(`${apiBase}/payments/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          amount: totalAmount,
          panNumber: formData.panNumber,
          certificate: formData.want80G,
          mahaprasadam: formData.wantPrasadam,
          sevakName: formData.sevakName.trim() || undefined,
          dob: formData.dob || undefined,
          prasadamAddress: formData.wantPrasadam ? {
            doorNo: formData.doorNo,
            house: formData.house,
            street: formData.street,
            area: formData.area,
            country: 'India',
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
          } : null,
          festivalSlug: config?.slug || config?.title || undefined,
          sourcePage: attribution.sourcePage,
          utm: attribution.payload().utm
        })
      });
      if (!orderRes.ok) throw new Error('Failed to create payment order');
      const orderBody = await orderRes.json();
  const { orderId, key, mock, order, donationId } = orderBody;

      if (mock) {
        setToast({ message: `Donation recorded (pending payment). Donation ID: ${donationId}`, type: 'success' });
        setTimeout(() => setToast({}), 4000);
        return;
      }

      const rzpOptions: any = {
        key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY || (window as any).__RAZORPAY_KEY__,
        amount: (order && order.amount) ? order.amount : Math.round(totalAmount * 100),
        currency: (order && order.currency) ? order.currency : 'INR',
        name: config?.title || 'Donation',
        description: 'Festival Seva Donation',
        order_id: orderId || (order && order.id),
        handler: async function (response: any) {
          const payload: any = {
            donorName: formData.name,
            donorEmail: formData.email,
            donorMobile: formData.mobile,
            amount: totalAmount,
            panNumber: formData.panNumber,
            certificate: formData.want80G,
            wantPrasadam: formData.wantPrasadam,
            prasadamAddress: formData.wantPrasadam ? {
              doorNo: formData.doorNo,
              house: formData.house,
              street: formData.street,
              area: formData.area,
              country: 'India',
              state: formData.state,
              city: formData.city,
              pincode: formData.pincode,
            } : null,
            festivalSlug: config?.slug || config?.title || undefined,
            type: 'Seva',
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            transactionId: response.razorpay_payment_id,
            status: 'paid'
          };

      const donateRes = await fetch(`${apiBase}/donations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
      ,      credentials: 'include' });
          if (!donateRes.ok) throw new Error('Failed to record donation after payment');
          window.location.assign(`/payment/thank-you?type=seva&seva=${encodeURIComponent(config?.title || 'Festival seva')}&amount=${totalAmount}&source=${encodeURIComponent(config?.title || 'our festival seva programmes')}`);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.mobile
        }
      };

      await razorpayReady();
      console.log('Opening Razorpay checkout with', { orderId: orderId || (order && order.id), key: key });
      new (window as any).Razorpay(rzpOptions).open();

    } catch (err) {
      console.error(err);
      const payload: any = {
        donorName: formData.name,
        donorEmail: formData.email,
        donorMobile: formData.mobile,
        amount: totalAmount,
        panNumber: formData.panNumber,
        certificate: formData.want80G,
        wantPrasadam: formData.wantPrasadam,
        prasadamAddress: formData.wantPrasadam ? {
          doorNo: formData.doorNo,
          house: formData.house,
          street: formData.street,
          area: formData.area,
          country: 'India',
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode,
        } : null,
        festivalSlug: config?.slug || config?.title || undefined,
        type: 'Seva',
      };

      fetch(`${apiBase}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      }).then(async (r) => {
        if (!r.ok) throw new Error('Failed to create donation');
        const data = await r.json();
        setToast({ message: `Donation recorded (pending payment). Please try paying again if needed.`, type: 'success' });
        setTimeout(() => setToast({}), 4000);
      }).catch((err2) => {
        console.error(err2);
        setToast({ message: 'Donation failed to record. Please try again later.', type: 'error' });
        setTimeout(() => setToast({}), 4000);
      });
    }
  };

  const inputCls = "w-full bg-white/5 border border-violet-300/20 rounded-lg px-4 py-2.5 text-violet-100 text-sm placeholder:text-violet-300/30 focus:outline-none focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/20 transition-all";

  return (
    <div id="donation-form" className="w-[calc(100%+10px)] mx-auto bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 rounded-2xl overflow-hidden border border-violet-400/10 shadow-2xl">
      <div className="px-6 py-4 text-center border-b border-violet-400/10">
        <h2 className="text-lg font-bold text-white tracking-widest">✦ Donation Details ✦</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-3">
  { DEFAULT_SEVA_OPTIONS.map((seva: any) => {
          const isExpanded = expandedSeva === seva.id;
          const selected = selectedSevas[seva.id];

          return (
            <div key={seva.id} className="border border-violet-400/15 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-indigo-900/60">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => toggleSeva(seva.id)} className="flex items-center gap-2 text-white text-sm font-medium">
                    <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center text-[10px] transition-colors ${selected ? "bg-amber-500 border-amber-500 text-amber-950" : "border-violet-400/40"}`}>{selected ? "✓" : ""}</span>
                    {seva.name}
                  </button>
                  {selected && (<span className="text-white/80 text-sm font-bold">₹{fmt(selected)}</span>)}
                </div>

                {
}
                {isExpanded && (
                  <div className="mt-3 p-2 bg-indigo-950/40 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      {(seva.amounts || []).map((amt: number) => (
                        <button key={amt} type="button" onClick={() => selectAmount(seva.id, amt)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selected === amt ? "bg-amber-500 text-amber-950 shadow-md" : "bg-white/5 text-violet-200 border border-violet-400/20 hover:border-violet-400/50"}`}>
                          ₹{fmt(amt)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {totalAmount > 0 && (
          <div className="flex justify-between items-center px-4 py-3 bg-amber-500/10 rounded-xl border border-amber-500/25">
            <span className="text-violet-100 font-semibold text-sm">Total Seva</span>
            <span className="text-blue-300 text-xl font-bold">₹{fmt(totalAmount)}</span>
          </div>
        )}

        <div className="border-t border-violet-400/10 pt-4">
          <h3 className="text-base font-semibold text-violet-100 mb-4">Personal Details</h3>
        </div>

        <div className="space-y-3">
          <input type="text" placeholder="Donor Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
          <input type="email" placeholder="Email ID (optional)" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} />
          <input type="tel" maxLength={10} inputMode="numeric" placeholder="Mobile Number *" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })} className={inputCls} />

          <DonorExtrasFields
            sevakName={formData.sevakName}
            dob={formData.dob}
            onSevakNameChange={(v) => setFormData({ ...formData, sevakName: v })}
            onDobChange={(v) => setFormData({ ...formData, dob: v })}
            collapsible
          />

          <label className="flex items-start gap-2 cursor-pointer py-1">
            <input type="checkbox" checked={formData.want80G} onChange={(e) => setFormData({ ...formData, want80G: e.target.checked })} className="mt-1 accent-amber-500" />
            <span className="text-violet-200/60 text-xs">I would like to receive 80(G) Certificate</span>
          </label>

          {formData.want80G && (
            <input type="text" placeholder="PAN Number" value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })} className={inputCls} />
          )}

          <label className="flex items-start gap-2 cursor-pointer py-1">
            <input type="checkbox" checked={formData.wantPrasadam} onChange={(e) => setFormData({ ...formData, wantPrasadam: e.target.checked })} className="mt-1 accent-amber-500" />
            <span className="text-violet-200/60 text-xs">I would like to receive Maha Prasadam (Only within India)</span>
          </label>

          {formData.wantPrasadam && (
            <div className="space-y-2 mt-2">
              <input type="text" placeholder="Door / House No" value={formData.doorNo} onChange={(e) => setFormData({ ...formData, doorNo: e.target.value })} className={inputCls} />
              <input type="text" placeholder="House / Appartment" value={formData.house} onChange={(e) => setFormData({ ...formData, house: e.target.value })} className={inputCls} />
              <input type="text" placeholder="Street name" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} className={inputCls} />
              <input type="text" placeholder="Location / Area" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className={inputCls} />
              <div className="grid grid-cols-2 gap-2">
                <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={inputCls}>
                  <option value="">Select State</option>
                  <option>Andhra Pradesh</option>
                  <option>Arunachal Pradesh</option>
                  <option>Assam</option>
                  <option>Bihar</option>
                  <option>Chhattisgarh</option>
                  <option>Goa</option>
                  <option>Gujarat</option>
                  <option>Haryana</option>
                  <option>Himachal Pradesh</option>
                  <option>Jharkhand</option>
                  <option>Karnataka</option>
                  <option>Kerala</option>
                  <option>Madhya Pradesh</option>
                  <option>Maharashtra</option>
                  <option>Manipur</option>
                  <option>Meghalaya</option>
                  <option>Mizoram</option>
                  <option>Nagaland</option>
                  <option>Odisha</option>
                  <option>Punjab</option>
                  <option>Rajasthan</option>
                  <option>Sikkim</option>
                  <option>Tamil Nadu</option>
                  <option>Telangana</option>
                  <option>Tripura</option>
                  <option>Uttar Pradesh</option>
                  <option>Uttarakhand</option>
                  <option>West Bengal</option>
                </select>
                <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputCls} />
              </div>
              <input type="text" placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className={inputCls} />
            </div>
          )}
        </div>

        <p className="text-violet-300/30 text-[11px] leading-relaxed">By continuing, you are agreeing to our Terms of Use and Privacy Policy.</p>

        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold py-3.5 rounded-xl text-base transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-95">
          {totalAmount > 0 ? `Donate ₹${fmt(totalAmount)}` : "Select Seva & Donate"}
        </button>
      </form>
    </div>
  );
}
