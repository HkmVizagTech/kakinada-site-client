import PageLayout from "@/components/PageLayout";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import EventRegistrationLoader from "@/components/EventRegistrationLoader";
import EventDetailClient from "@/components/EventDetailClient";
import Image from "next/image";

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3000";
  let event: any = null;
  let fetchStatus: number | null = null;
  let fetchBody: any = null;
  try {
    // ensure we always fetch fresh data for event detail pages so newly created events
    // by admins appear immediately instead of returning a cached "not found"
    const res = await fetch(`${apiUrl}/events/${id}`, { cache: 'no-store' });
    fetchStatus = res.status;
    try {
      fetchBody = await res.json();
    } catch (e) {
      fetchBody = await res.text().catch(() => null);
    }
    if (res.ok) {
      event = fetchBody?.event;
    }
  } catch (e) {
  }

  if (!event) {
    // render a client boundary that will try to fetch the event and show registration form if it appears
    return (
      <PageLayout>
        <EventDetailClient id={id} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHero title={event.title} subtitle={event.description} breadcrumb={event.title} backgroundImage={event.images && event.images[0] ? event.images[0] : "/assets/gallery-festival-2.jpg"} />
      <section className="py-12 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card rounded-2xl p-6">
            <h1 className="font-heading text-2xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground mb-4">{new Date(event.date).toLocaleString()}</p>
            {event.images && event.images[0] && <div className="w-full h-72 relative mb-4"><Image src={event.images[0]} alt={event.title} fill sizes="100vw" className="object-cover rounded-lg"/></div>}
            <p className="mb-6">{event.description}</p>

            {
}
            <EventRegistrationLoader eventId={event._id || id} initialFormSchema={event.registrationForm} initialEvent={event} />
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
