import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
  align = "center",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  light?: boolean;
  align?: "center" | "left";
}) {
  const center = align === "center";
  return (
    <Reveal className={cn("mb-8 md:mb-12", center ? "text-center" : "text-left")}>
      {eyebrow && (
        <p className={cn("mb-2 text-xs font-extrabold uppercase tracking-[0.22em]", light ? "text-vb-brass-300" : "text-vb-lotus-500")}>{eyebrow}</p>
      )}
      <h2 className={cn("font-vb-heading text-[1.9rem] font-semibold leading-[1.05] sm:text-4xl md:text-5xl", light ? "text-white" : "text-vb-brand-700")}>{title}</h2>
      {subtitle && <p className={cn("mt-3 max-w-2xl", center && "mx-auto", light ? "text-white/80" : "text-gray-600")}>{subtitle}</p>}
      <div className={cn("mt-4 h-0.5 w-12 bg-vb-brass-400", center && "mx-auto")} />
    </Reveal>
  );
}
