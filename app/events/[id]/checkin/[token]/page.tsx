"use client";

import React, { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";

export default function CheckinPage({ params }: any) {
  const { id, token } = params;
  const [status, setStatus] = useState<string | null>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function doCheckin() {
      setLoading(true);
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3000";
  const res = await fetch(`${apiUrl}/events/${id}/checkin/${encodeURIComponent(token)}`, { method: 'POST', credentials: 'include' });
        const json = await res.json();
        if (res.ok) {
          setStatus(json.message || 'Checked in');
          setRegistration(json.registration || null);
        } else {
          setStatus(json.message || 'Check-in failed');
        }
      } catch (e) {
        setStatus('Check-in failed');
      }
      setLoading(false);
    }
    doCheckin();
  }, [id, token]);

  return (
    <PageLayout>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-card rounded-2xl p-8 text-center">
            {loading ? (
              <div>Processing check-in...</div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{status}</h2>
                {registration && (
                  <div className="text-left mt-4">
                    <h3 className="font-semibold">Registrant details</h3>
                    <div className="mt-2 space-y-2">
                      {Object.entries(registration.data || {}).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b pb-2">
                          <div className="text-sm text-muted-foreground">{k}</div>
                          <div className="text-sm font-medium">{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
