import { notFound } from "next/navigation";
import Link from "next/link";
import HeroBanner from '@/components/festival/HeroBanner';
import ContentSection from '@/components/festival/ContentSection';
import DonationFormWrapper from '@/components/festival/DonationFormWrapper';
import PageLayout from "@/components/PageLayout";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";

async function getFestivalDonation(slug: string) {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"; // server runs on 8080 in this workspace
  try {
    const res = await fetch(`${base}/festival-donations/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
  console.error('getFestivalDonation fetch error', (err && (err as any).message) ? (err as any).message : err);
    return null;
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getFestivalDonation(slug);
  if (!page) return notFound();
  const config = {
  slug: page.slug,
    bannerImage: page.images?.[0] || (page.meta?.bannerImage || ''),
    superTitle: page.meta?.superTitle || "Srila Prabhupada's",
    title: page.title,
    subtitle: page.meta?.subtitle || page.event?.name || '',
    eventDate: page.event?.date || page.meta?.eventDate || '',
    heroSevaList: (page.donationOptions && page.donationOptions.length) ? page.donationOptions.map((o: any) => o.label).join(' | ') : page.meta?.heroSevaList || '',

    sectionHeading: page.meta?.sectionHeading || 'Offer Your Seva',
    descriptions: page.meta?.descriptions || (page.description ? [page.description] : []),
    taxTitle: page.meta?.taxTitle || 'Tax Benefits',
    taxDescription: page.meta?.taxDescription || (page.meta?.amount ? `Avail 80G tax exemption on donations.` : ''),

    sevaOptions: (page.donationOptions && page.donationOptions.length)
      ? page.donationOptions.map((o: any, idx: number) => ({ id: o.label?.toLowerCase().replace(/[^a-z0-9]+/g,'-') || `opt-${idx}`, name: o.label || 'General', amounts: [Number(o.amount) || Number(o.amount) || 0] }))
      : page.meta?.sevaOptions || [],
  };

  return (
    <PageLayout>
    <WhatsAppFloatButton />
    <main className="min-h-screen bg-background pt-[88px] md:pt-[104px]">
  <HeroBanner config={config} />

      <div className="container mx-auto px-4 py-12 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <ContentSection config={config} />
        </div>

  <aside className="lg:col-span-2">
          <DonationFormWrapper config={config} />
        </aside>
      </div>
    </main>
    </PageLayout>
  );
}
