"use client";

import React, { useEffect, useState } from "react";
import PageHero from "@/components/PageHero";
import EventRegistrationLoader from "./EventRegistrationLoader";
import Image from "next/image";

export default function EventDetailClient({ id }: { id: string }) {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/events/${id}`, { credentials: 'include' });
        if (!mounted) return;
        if (!res.ok) {
          setEvent(null);
          return;
        }
        const json = await res.json();
        setEvent(json.event || null);
      } catch (e) {
        setEvent(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchEvent();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return null;
  if (!event) return <div className="py-12 max-w-3xl mx-auto"><div className="bg-card rounded-2xl p-6 text-center">Event not found</div></div>;

  return (
    <>
      <PageHero title={event.title} subtitle={event.description} breadcrumb={event.title} backgroundImage={event.images && event.images[0] ? event.images[0] : "/assets/gallery-festival-2.jpg"} />
      <section className="py-12 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card rounded-2xl p-6">
            <h1 className="font-heading text-2xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground mb-4">{new Date(event.date).toLocaleString()}</p>
            {event.images && event.images[0] && <div className="w-full h-72 relative mb-4"><Image src={event.images[0]} alt={event.title} fill sizes="100vw" className="object-cover rounded-lg"/></div>}
            <p className="mb-6">{event.description}</p>
            <EventRegistrationLoader eventId={event._id || id} initialFormSchema={event.registrationForm} initialEvent={event} />
          </div>
        </div>
      </section>
    </>
  );
}
