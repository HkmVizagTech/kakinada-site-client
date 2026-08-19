"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";


import React, { useEffect, useState } from "react";
import RegistrationsList from "@/components/admin/RegistrationsList";
import { useSearchParams, useRouter } from "next/navigation";

export default function AdminEventRegistrationsPage() {
  const search = useSearchParams();
  const router = useRouter();
  const eventId = search?.get("eventId") || "";
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/events`);
        if (!res.ok) return;
        const json = await res.json();
        setEvents(json.events || []);
        if (!eventId && Array.isArray(json.events) && json.events.length) {
          router.replace(`/admin/events/registrations?eventId=${json.events[0]._id || json.events[0].id}`);
        }
      } catch (e) {
      }
    };
    fetchEvents();
  }, []);

  if (!eventId) {
    return (<div className="p-4 text-sm text-muted-foreground">Loading registrations…</div>);
  }

  return (
    <RegistrationsList eventId={eventId} tableOnly />
  );
}
