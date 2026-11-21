import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared backdrop for public pages: plain ivory with one very faint warm light at the top. */
export default function PublicShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative min-h-screen overflow-x-clip bg-vb-page", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px]"
        style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 78% 20%, rgba(201,162,74,0.12), transparent 70%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
