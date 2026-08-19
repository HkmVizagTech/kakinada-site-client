import Navbar from "@/components/Navbar";
import TempleCarousel from "@/components/TempleCarousel";
import TodaysDarshan from "@/components/TodaysDarshan";
import AboutSection from "@/components/AboutSection";
import FounderSection from "@/components/FounderSection";
import SevasSection from "@/components/SevasSection";
import GalleryPreview from "@/components/GalleryPreview";
import BlogPreview from "@/components/BlogPreview";
import SubhojanamSection from "@/components/SubhojanamSection";
import ContactSection from "@/components/ContactSection";
import WhatsAppCommunityCTA from "@/components/WhatsAppCommunityCTA";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

// Homepage's own canonical — previously this was inherited from a
// sitewide root-layout default that also (incorrectly) applied to every
// other page. Now that the root no longer sets one, the homepage needs
// its own explicit self-reference.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-background pt-[88px] md:pt-[104px]">
      <Navbar />
      <TempleCarousel />
      <TodaysDarshan />
      <AboutSection />
      <FounderSection />
      <SevasSection />
      <GalleryPreview />
      {/* Upcoming Celebrations temporarily disabled — component kept intact
          in components/EventsPreview.tsx, just not rendered here for now. */}
      <BlogPreview />
      <SubhojanamSection />
      <ContactSection />
      <WhatsAppCommunityCTA />
      <Footer />
    </div>
  );
}
