import { Suspense } from "react";
import SevaCampaignClient from "@/components/seva-campaign/SevaCampaignClient";
import { GITA_DAAN_CAMPAIGN } from "@/lib/sevaCampaignConfig";

export const metadata = {
  title: GITA_DAAN_CAMPAIGN.metaTitle,
  description: GITA_DAAN_CAMPAIGN.metaDesc,
  alternates: { canonical: "/gita-daan-seva" },
  openGraph: {
    title: GITA_DAAN_CAMPAIGN.ogTitle,
    description: GITA_DAAN_CAMPAIGN.ogDesc,
    images: [GITA_DAAN_CAMPAIGN.ogImage],
  },
};

export default function GitaDaanSevaPage() {
  return (
    <Suspense fallback={null}>
      <SevaCampaignClient slug={GITA_DAAN_CAMPAIGN.slug} />
    </Suspense>
  );
}
