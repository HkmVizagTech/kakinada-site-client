"use client";

import { useCallback } from "react";
import { preloadRazorpay } from "@/lib/vanabhojanam/razorpay";
import PublicShell from "../ui/PublicShell";
import SectionHeading from "../ui/SectionHeading";
import { useCurrentEvent } from "../context/CurrentEventContext";
import Hero from "./Hero";
import RegistrationForm from "./RegistrationForm";
import { EventStrip, Faq, Highlights, HowItWorks, RegistrationClosed, VanabhojanaStory } from "./Sections";
import { SiteFooter, SiteHeader } from "./SiteChrome";

/** The /vanabhojanam landing + registration page. */
export default function LandingPage() {
  const { event, status } = useCurrentEvent();
  const open = Boolean(event?.registrationOpen);

  const scrollToForm = useCallback(() => {
    preloadRazorpay();
    document.getElementById("register-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <PublicShell>
      <SiteHeader onRegister={scrollToForm} />
      <Hero onRegister={scrollToForm} />
      <div className="relative z-[2] -mt-6 md:-mt-10">
        <EventStrip />
      </div>
      <Highlights />
      <VanabhojanaStory />
      <HowItWorks />
      <section id="register-section" className="mx-auto mt-16 w-full max-w-2xl scroll-mt-[84px] px-4 md:mt-28 md:px-6">
        <SectionHeading eyebrow="Join us" title="Reserve your place" />
        <div>{open ? <RegistrationForm /> : <RegistrationClosed event={event} loading={status === "loading"} />}</div>
      </section>
      <Faq />
      <SiteFooter />
    </PublicShell>
  );
}
