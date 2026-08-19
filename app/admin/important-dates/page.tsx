import AdminImportantDatesPage from "./page-content";

// Admin pages must never be statically cached at the CDN edge.
export const dynamic = "force-dynamic";

export default function Page() {
  return <AdminImportantDatesPage />;
}
