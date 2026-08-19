import { Suspense } from "react";
import SevaCampaignClient from "@/components/seva-campaign/SevaCampaignClient";
import { ANNA_DAAN_CAMPAIGN } from "@/lib/sevaCampaignConfig";

export const metadata = {
  title: ANNA_DAAN_CAMPAIGN.metaTitle,
  description: ANNA_DAAN_CAMPAIGN.metaDesc,
  alternates: { canonical: "/anna-daan-seva" },
  openGraph: {
    title: ANNA_DAAN_CAMPAIGN.ogTitle,
    description: ANNA_DAAN_CAMPAIGN.ogDesc,
    images: [ANNA_DAAN_CAMPAIGN.ogImage],
  },
};

export default function AnnaDaanSevaPage() {
  return (
    <Suspense fallback={null}>
      <SevaCampaignClient slug={ANNA_DAAN_CAMPAIGN.slug} />
    </Suspense>
  );
}
