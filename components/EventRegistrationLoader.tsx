"use client";

import React, { useEffect, useState } from "react";
import EventRegistrationForm from "./EventRegistrationForm";

interface Props {
  eventId: string;
  initialFormSchema?: any;
  initialEvent?: any;
}

export default function EventRegistrationLoader({ eventId, initialFormSchema, initialEvent }: Props) {
  const [formSchema, setFormSchema] = useState<any | null>(initialFormSchema || null);
  const [event, setEvent] = useState<any | null>(initialEvent || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
   
    if (!formSchema) {
      let mounted = true;
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";
      const tryFetch = async (attempt: number) => {
        try {
          setLoading(true);
          const res = await fetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });
          if (!mounted) return false;
          if (!res.ok) return false;
          const json = await res.json();
          const ev = json.event || null;
          if (ev) {
            if (!mounted) return true;
            setEvent(ev);
            if (ev.registrationForm && ev.registrationForm.enabled) setFormSchema(ev.registrationForm);
            return true;
          }
          return false;
        } catch (e) {
          return false;
        } finally {
          if (mounted) setLoading(false);
        }
      };

      (async () => {
        const maxAttempts = 6;
        for (let i = 0; i < maxAttempts && mounted && !formSchema; i++) {
          const ok = await tryFetch(i + 1);
          if (ok) break;
         
          await new Promise((r) => setTimeout(r, 250 * Math.pow(2, i)));
        }
      })();

      return () => { mounted = false; };
    }
  }, [eventId, formSchema]);

  if (!formSchema) {
   
    return null;
  }

  return <EventRegistrationForm eventId={eventId} formSchema={formSchema} event={event || undefined} />;
}
