import type { Metadata } from "next";
import AdminShell from "@/components/vanabhojanam/admin/AdminShell";

// The console is for volunteers and admins only: keep it out of search results.
export const metadata: Metadata = {
  title: "Vanabhojanam Admin",
  robots: { index: false, follow: false },
  alternates: { canonical: "/vanabhojanam/admin" },
};

export default function VanabhojanamAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
