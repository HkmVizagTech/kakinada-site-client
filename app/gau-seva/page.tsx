import { Suspense } from "react";
import SevaCampaignClient from "@/components/seva-campaign/SevaCampaignClient";
import { GAU_CAMPAIGN } from "@/lib/sevaCampaignConfig";

export const metadata = {
  title: GAU_CAMPAIGN.metaTitle,
  description: GAU_CAMPAIGN.metaDesc,
  alternates: { canonical: "/gau-seva" },
  openGraph: {
    title: GAU_CAMPAIGN.ogTitle,
    description: GAU_CAMPAIGN.ogDesc,
    images: [GAU_CAMPAIGN.ogImage],
  },
};

export default function GauSevaPage() {
  return (
    <Suspense fallback={null}>
      <SevaCampaignClient slug={GAU_CAMPAIGN.slug} />
    </Suspense>
  );
}
