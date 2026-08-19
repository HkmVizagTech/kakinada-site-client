"use client";
import React from 'react';

type Config = {
  bannerImage?: string;
  superTitle?: string;
  title?: string;
  subtitle?: string;
  eventDate?: string;
  heroSevaList?: string;
};

export default function HeroBanner({ config, onDonateClick }: { config: Config; onDonateClick?: () => void }) {
  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden rounded-b-3xl">
      {
}
      {config.bannerImage ? (
        <img src={config.bannerImage} alt={config.title || 'Festival Banner'} className="absolute inset-0 w-full h-full object-cover" />
      ) : null}
      {
}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-indigo-900/60 to-indigo-950/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0845]/70 via-transparent to-transparent" />

      {
}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <p className="text-amber-300 text-xs md:text-sm tracking-[0.35em] uppercase mb-4 font-medium">{config.superTitle}</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-3 drop-shadow-lg">{config.title}</h1>
        <p className="text-violet-300 text-base md:text-lg tracking-wide mb-2">{config.subtitle}</p>
        <p className="text-white/70 text-sm md:text-base font-semibold mt-4 mb-6 uppercase tracking-widest">{config.eventDate}</p>

  {
}

        <div>
          {onDonateClick ? (
            <button onClick={onDonateClick} className="inline-block bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-10 py-3.5 rounded-xl text-base md:text-lg transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95">
              Donate Now
            </button>
          ) : (
            <a href="#donation-form" className="inline-block bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-10 py-3.5 rounded-xl text-base md:text-lg transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95">
              Donate Now
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
