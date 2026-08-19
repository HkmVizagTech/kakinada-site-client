import React from 'react';

type Config = {
  sectionHeading?: string;
  descriptions?: string[];
  taxTitle?: string;
  taxDescription?: string;
};

export default function ContentSection({ config }: { config: Config }) {
  return (
    <div className="space-y-5 lg:sticky lg:top-24">
      {
}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-amber-400/60 text-2xl select-none">✦</span>
        <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-wide">{config.sectionHeading}</h2>
        <span className="text-amber-400/60 text-2xl select-none">✦</span>
      </div>

      {(config.descriptions || []).map((para, i) => (
        <p key={i} className="text-foreground/85 leading-relaxed text-base">{para}</p>
      ))}

  {
}
    </div>
  );
}
