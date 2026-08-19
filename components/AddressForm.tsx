"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

export interface PrasadamAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface AddressFormProps {
  address: PrasadamAddress;
  setAddress: React.Dispatch<React.SetStateAction<PrasadamAddress>>;
}

export default function AddressForm({ address, setAddress }: AddressFormProps) {
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const lastPin = useRef("");

  useEffect(() => {
    const pin = address.pincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      lastPin.current = "";
      return;
    }
    if (lastPin.current === pin) return;
    lastPin.current = pin;

    let cancelled = false;
    setPinLoading(true);
    setPinError(null);
    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const rec = Array.isArray(data) ? data[0] : null;
        const po = rec?.Status === "Success" ? rec?.PostOffice?.[0] : null;
        if (po) {
          setAddress((prev) => ({
            ...prev,
            city: po.District || po.Block || po.Name || prev.city,
            state: po.State || prev.state,
          }));
        } else {
          setPinError("Couldn't find that PIN code — please enter city & state manually.");
        }
      })
      .catch(() => {
        if (!cancelled) setPinError("Couldn't look up PIN code — please enter city & state manually.");
      })
      .finally(() => {
        if (!cancelled) setPinLoading(false);
      });

    return () => { cancelled = true; };
  }, [address.pincode]);

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
        Delivery address for your Maha Prasadam courier
      </p>
      <input
        type="text"
        required
        value={address.street}
        onChange={(e) => setAddress({ ...address, street: e.target.value })}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs outline-none focus:border-gold"
        placeholder="Door / flat no. & area, street *"
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <input
            type="text"
            required
            inputMode="numeric"
            maxLength={6}
            value={address.pincode}
            onChange={(e) =>
              setAddress({ ...address, pincode: e.target.value.replace(/[^\d]/g, "").slice(0, 6) })
            }
            className="h-9 w-full rounded-lg border border-border bg-card px-3 pr-8 text-xs outline-none focus:border-gold"
            placeholder="PIN code *"
          />
          {pinLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-gold" />
          )}
        </div>
        <input
          type="text"
          required
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-gold"
          placeholder="City *"
        />
        <input
          type="text"
          required
          value={address.state}
          onChange={(e) => setAddress({ ...address, state: e.target.value })}
          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-gold"
          placeholder="State *"
        />
      </div>
      {pinError ? (
        <p className="text-[11px] text-red-600">{pinError}</p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Enter your PIN code and we&apos;ll fill in city &amp; state automatically.
        </p>
      )}
    </div>
  );
}
