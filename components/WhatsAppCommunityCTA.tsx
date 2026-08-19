"use client";

import { MessageCircle, ArrowRight } from "lucide-react";

const WA_CHANNEL_LINK = "https://whatsapp.com/channel/0029VaZDEG67T8bWHjibTy2u";

export default function WhatsAppCommunityCTA() {
  return (
    <section className="bg-gradient-to-r from-[#075e54] via-[#128c7e] to-[#25D366] py-6 md:py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white md:text-xl">
              Join Our WhatsApp Channel
            </h3>
            <p className="text-sm text-white/75">
              Get festival updates, daily spiritual wisdom & connect with devotees
            </p>
          </div>
        </div>
        <a
          href={WA_CHANNEL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#128c7e] shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
        >
          Join Now
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
