import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";

export interface EventCardProps {
  event: {
    _id?: string;
    title: string;
    date: string;
    time?: string;
    location?: string;
    description?: string;
    image?: string;
    featured?: boolean;
  };
  href?: string;
  smallCard?: boolean;
}

import { useEffect, useState } from "react";

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number }>({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  if (new Date(targetDate).getTime() < Date.now()) return null;
  return (
    <div className="mt-2 text-xs text-primary font-semibold flex flex-wrap gap-2 justify-center">
      <span>Starts in:</span>
      <span>{timeLeft.days}d</span>
      <span>{timeLeft.hours}h</span>
      <span>{timeLeft.mins}m</span>
      <span>{timeLeft.secs}s</span>
    </div>
  );
}

export default function EventCard({ event, href, smallCard }: EventCardProps) {
  const formattedDate = event.date ? new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : event.date;
  const now = Date.now();
  const eventTime = event.date ? new Date(event.date).getTime() : 0;
  const isCompleted = eventTime < now;
  return (
    <Link href={href || "/events"} className={smallCard ? "block group focus:outline-none" : "block group focus:outline-none col-span-full"}>
      <div
        className={
          smallCard
            ? "bg-card rounded-xl p-3 border border-border hover:border-primary/40 hover:bg-primary/5 hover:ring-2 hover:ring-primary/10 transition-colors group flex flex-col items-start min-h-[240px] h-full pb-6"
            : "bg-card rounded-2xl p-6 md:p-8 border border-border hover:border-primary/40 hover:ring-2 hover:ring-primary/10 transition-colors group flex flex-col md:flex-row md:items-center gap-6 min-h-[180px]"
        }
      >
        <div
          className={
            smallCard
              ? "w-full h-36 md:h-44 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden relative mb-2"
              : "shrink-0 w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-2xl flex items-center justify-center overflow-hidden relative"
          }
        >
          {event.image && (
            <Image src={event.image} alt={event.title} fill sizes="(max-width: 640px) 100vw, 200px" className="rounded-2xl object-cover" style={{ objectPosition: "center" }} />
          )}
          {event.featured && (
            <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2.5 py-1 rounded-full text-xs font-semibold z-10">
              Featured
            </div>
          )}
          {
}
          {(event as any).registrationForm?.enabled && (
            <div className="absolute bottom-3 right-3 z-10">
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Register</span>
            </div>
          )}
          {
}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${isCompleted ? "bg-gray-200 text-gray-700" : "bg-green-200 text-green-800 animate-pulse"}`}>
              {isCompleted ? "Completed" : "Soon"}
            </span>
          </div>
        </div>
        <div className={smallCard ? "w-full flex-1 flex flex-col justify-between items-start text-left pl-2" : "grow flex flex-col justify-center"}>
          <h3 className={smallCard ? "font-heading text-sm md:text-base font-semibold text-foreground mb-1" : "font-heading text-2xl font-semibold text-foreground mb-2"}>{event.title}</h3>
          <p className={smallCard ? "text-muted-foreground text-xs mb-1 line-clamp-2" : "text-muted-foreground text-sm mb-3 line-clamp-2"}>{event.description}</p>
          <div className={smallCard ? "flex flex-wrap gap-2 text-sm text-muted-foreground justify-center" : "flex flex-wrap gap-4 text-sm text-muted-foreground"}>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /> {formattedDate}
            </span>
            {event.time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /> {event.time}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /> {event.location}
              </span>
            )}
          </div>
          {
}
          {event.date && <Countdown targetDate={event.date} />}
        </div>
      </div>
    </Link>
  );
}
