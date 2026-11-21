import type { ReactNode } from "react";
import Image from "next/image";
import { IMAGES } from "@/lib/vanabhojanam/config";
import PublicShell from "./PublicShell";

export default function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <PublicShell>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-xl md:p-8">
          <div className="mb-6 flex flex-col items-center gap-1 text-center">
            <Image src={IMAGES.logo} alt="" width={64} height={64} className="h-16 w-16 rounded-full" unoptimized />
            <h1 className="font-vb-heading text-3xl font-semibold text-vb-brand-700">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </PublicShell>
  );
}
