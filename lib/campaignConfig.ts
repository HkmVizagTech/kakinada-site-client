import {
  UtensilsCrossed, Sparkles, FileCheck2, Landmark,
  ScrollText, Award, HeartHandshake, Building2,
} from "lucide-react";
import type { ComponentType } from "react";

export interface DonorEntry {
  name: string;
  amount: number;
  sqft: number;
  time: string;
}

export interface CampaignerData {
  name: string;
  slug: string;
  goalSqft: number;
  message: string;
  raisedAmount: number;
  sqftRaised: number;
  donorCount: number;
  donors: DonorEntry[];
}

export interface Privilege {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}

/**
 * A limited, higher-value tier that lives inside a campaign — currently the
 * Golden Brick Seva under Brick Seva: 10,008 gilded bricks, laid in the
 * garbhagudi (sanctum sanctorum) itself, each carrying the donor's name.
 *
 * `taken` is maintained by hand ON PURPOSE. It is a sacred, finite count that
 * also moves through offline offerings the website never sees, so a single
 * edited number is both simpler and safer than a live query that would quietly
 * under-report. Update the one line below as bricks are offered.
 */
export interface GoldenTierConfig {
  /** Shown to donors, and recorded as the donation's sevaName. Keeping the
   *  word "brick" in it matters: the DCC sync maps seva names containing
   *  "brick" to the Mandir Nirman brick code (MNSO-B), which is where these
   *  offerings belong for accounting. */
  sevaName: string;
  orderType: string;
  unitName: string;
  unitNamePlural: string;
  price: number;
  /** Total bricks that will ever exist in this tier. */
  total: number;
  /** How many have been offered so far — edit this as they go. */
  taken: number;
  placement: string;
  presets: number[];
  /** The gilded brick, engraved and ready for the sanctum. */
  goldenImage: string;
  benefits: string[];
}

export interface CampaignConfig {
  type: "SQFT" | "BRICK";
  pageTitle: string;
  metaTitle: string;
  metaDesc: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  pricePerUnit: number;
  unitName: string;
  unitNamePlural: string;
  unitShort: string;
  minCustomAmount: number;
  phone: string;
  phoneHref: string;
  email: string;
  heroImage: string;
  // Optional pre-designed banner (text baked in). When set, the hero renders
  // this full-bleed image instead of the background + overlaid HTML text.
  bannerImage?: string;
  bannerImageMobile?: string;
  /** Natural dimensions of bannerImage (desktop) so it renders at its true aspect ratio. */
  bannerWidth?: number;
  bannerHeight?: number;
  /** Natural dimensions of bannerImageMobile (portrait). */
  bannerMobileWidth?: number;
  bannerMobileHeight?: number;
  aboutImage: string;
  heroTagline: string;
  heroHeading1: string;
  heroHeading2: string;
  heroDesc: string;
  formHeading: string;
  formSubheading: string;
  privileges: Privilege[];
  higherPrivileges: Privilege[];
  statsApiEndpoint: string;
  orderType: string;
  /** Present only on campaigns that offer a limited premium tier. */
  goldenTier?: GoldenTierConfig;

  /** Brick campaigns only: the laser engraver at the temple that inscribes
   *  each donor's name on the regular (₹1,500) bricks. Shown beside the
   *  donation form and in donor privileges; the golden tier carries its own
   *  imagery inside GoldenBrickSection. */
  engravingImage?: string;
}

// NOTE (ISKCON Kakinada): SQFT_CAMPAIGN and BRICK_CAMPAIGN below describe
// Hare Krishna Movement Vizag's own Vaikuntham Temple construction fund.
// Kakinada has no equivalent construction campaign page yet, so these two
// configs are inert here — kept only so shared components that import this
// file's types/defaults (e.g. DonorPrivilegesSection) still compile. Do not
// point a live Kakinada page at them without rewriting the copy/branding.
export const SQFT_CAMPAIGN: CampaignConfig = {
  type: "SQFT",
  pageTitle: "Square Foot Seva",
  metaTitle: "Square Foot Seva | Hare Krishna Vaikuntham Temple, Visakhapatnam",
  metaDesc:
    "Be a part of the Hare Krishna Vaikuntham Temple in the making. Sponsor one or more square feet of construction at ₹2,100 per square foot and receive prasadam, a contribution certificate and 80G tax exemption.",
  ogTitle: "Square Foot Seva — Hare Krishna Vaikuntham Temple",
  ogDesc:
    "Sponsor the sacred ground of the rising temple. Every square foot becomes a permanent part of the Lord's abode.",
  ogImage: "/assets/home-temple-construction-banner.webp",
  pricePerUnit: 2100,
  unitName: "square foot",
  unitNamePlural: "square feet",
  unitShort: "sq ft",
  minCustomAmount: 500,
  phone: "+91 89777 61187",
  phoneHref: "tel:+918977761187",
  email: "social@hkmvizag.org",
  heroImage:
    "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783672822355-1783672821116-ChatGPTImageJul92026043238PM.png",
  bannerImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786528614525-1786528613759-ChatGPTImageAug122026022735PM.webp",
  bannerImageMobile: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786528614019-1786528613497-ChatGPTImageAug122026032403PM.webp",
  bannerWidth: 2033,
  bannerHeight: 773,
  bannerMobileWidth: 964,
  bannerMobileHeight: 1632,
  aboutImage: "https://res.cloudinary.com/ddmzeqpkc/image/upload/f_auto,q_auto/phase_1",
  heroTagline: "A fundraising initiative of Hare Krishna Movement Visakhapatnam",
  heroHeading1: "Hare Krishna",
  heroHeading2: "Vaikuntham Temple",
  heroDesc:
    "Be a part of the temple in the making — sponsor one or more square feet of construction, and become a permanent part of the Lord's abode.",
  formHeading: "Sponsor Your Square Feet",
  formSubheading:
    "Every square foot becomes a permanent part of the Lord's abode. Choose a clear and meaningful donation path with confidence.",
  privileges: [
    { icon: UtensilsCrossed, title: "Sanctified Prasadam", text: "Receive the Lord's prasadam from the temple as a blessing for your seva (within India)." },
    { icon: Sparkles, title: "Puja Participation", text: "Participate in the pujas conducted on the auspicious inauguration day of the temple." },
    { icon: FileCheck2, title: "Contribution Certificate", text: "A digital certificate honouring your valued contribution to the temple construction." },
    { icon: Landmark, title: "80G Tax Exemption", text: "Donations qualify for tax exemption under Section 80G of the Income Tax Act." },
  ],
  higherPrivileges: [
    { icon: ScrollText, title: "Name Inscription", text: "Larger contributions are honoured with the donor's family name inscribed at the temple." },
    { icon: Award, title: "Maha Prasadam Box", text: "A special Maha prasadam box offered to Their Lordships, sent to your home." },
    { icon: HeartHandshake, title: "Special Family Pujas", text: "Pujas performed on special occasions of your family — birthdays and anniversaries." },
    { icon: Building2, title: "Inauguration Invitation", text: "A personal invitation to the grand Prana Pratistha ceremonies of Their Lordships." },
  ],
  statsApiEndpoint: "/seva-stats/sqft-campaign",
  orderType: "SQFT",
};

export const BRICK_CAMPAIGN: CampaignConfig = {
  type: "BRICK",
  pageTitle: "Brick Seva",
  metaTitle: "Brick Seva ISKCON Vizag | Hare Krishna Vaikuntham Temple, Visakhapatnam",
  metaDesc:
    "Sponsor bricks for the Hare Krishna Vaikuntham Temple (ISKCON Vizag) at ₹1,500 per brick. Every brick becomes an eternal part of the Lord's abode — with prasadam, contribution certificate and 80G tax exemption.",
  ogTitle: "Brick Seva — Hare Krishna Vaikuntham Temple",
  ogDesc:
    "Sponsor bricks for the temple construction. Every brick laid with devotion becomes part of the Lord's eternal home.",
  ogImage: "/assets/vizag-temple-1.jpeg",
  pricePerUnit: 1500,
  unitName: "brick",
  unitNamePlural: "bricks",
  unitShort: "brick",
  minCustomAmount: 500,
  phone: "+91 89777 61187",
  phoneHref: "tel:+918977761187",
  email: "social@hkmvizag.org",
  heroImage:
    "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677097861-1783677097620-Screenshot2026-07-10152116.png",
  bannerImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785588189215-1785588187426-brick-hero-desk.webp",
  bannerImageMobile: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785588190376-1785588188370-brick-hero-mob.webp",
  bannerWidth: 2032,
  bannerHeight: 774,
  bannerMobileWidth: 961,
  bannerMobileHeight: 1636,
  aboutImage: "/assets/vizag-temple-1.jpeg",
  heroTagline: "A fundraising initiative of Hare Krishna Movement Visakhapatnam",
  heroHeading1: "Hare Krishna",
  heroHeading2: "Vaikuntham Temple",
  heroDesc:
    "Be a part of the temple in the making — sponsor one or more bricks of construction, and become a permanent part of the Lord's abode.",
  formHeading: "Sponsor Your Bricks",
  formSubheading:
    "Every brick becomes a permanent part of the Lord's abode. Choose a clear and meaningful donation path with confidence.",
  privileges: [
    { icon: UtensilsCrossed, title: "Sanctified Prasadam", text: "Receive the Lord's prasadam from the temple as a blessing for your seva (within India)." },
    { icon: Sparkles, title: "Puja Participation", text: "Participate in the pujas conducted on the auspicious inauguration day of the temple." },
    { icon: FileCheck2, title: "Contribution Certificate", text: "A digital certificate honouring your valued contribution to the temple construction." },
    { icon: Landmark, title: "80G Tax Exemption", text: "Donations qualify for tax exemption under Section 80G of the Income Tax Act." },
  ],
  higherPrivileges: [
    { icon: ScrollText, title: "Name Inscription", text: "Larger contributions are honoured with the donor's family name inscribed at the temple." },
    { icon: Award, title: "Maha Prasadam Box", text: "A special Maha prasadam box offered to Their Lordships, sent to your home." },
    { icon: HeartHandshake, title: "Special Family Pujas", text: "Pujas performed on special occasions of your family — birthdays and anniversaries." },
    { icon: Building2, title: "Inauguration Invitation", text: "A personal invitation to the grand Prana Pratistha ceremonies of Their Lordships." },
  ],
  statsApiEndpoint: "/seva-stats/brick-campaign",
  orderType: "BRICK",

  /** The laser engraver at the temple that puts donor names on the bricks. */
  engravingImage:
    "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1788937886348-1788937885266-lasermachine.webp",

  goldenTier: {
    sevaName: "Golden Brick Seva",
    orderType: "GOLDEN_BRICK",
    unitName: "golden brick",
    unitNamePlural: "golden bricks",
    price: 11000,
    total: 10008,
    // ── Offered so far (≈21%, i.e. 2,102 of 10,008). EDIT THIS NUMBER as golden bricks are taken. ──
    taken: 2102,
    placement: "Garbhagudi — the sanctum sanctorum",
    presets: [1, 2, 5, 11],
    goldenImage:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1788937885719-1788937885020-goldenbricklasermachine.webp",
    benefits: [
      "Your name laser-engraved on a gilded brick, one of only 10,008.",
      "Laid in the garbhagudi itself — the innermost sanctum, beneath Their Lordships.",
      "A photograph of your engraved brick, sent to you before it is laid.",
      "Personal invitation to the Prana Pratistha ceremonies.",
      "Maha prasadam offered to Their Lordships, sent to your home.",
      "80G tax exemption on your full offering.",
    ],
  },
};

export const getCampaignConfig = (type: "SQFT" | "BRICK"): CampaignConfig =>
  type === "SQFT" ? SQFT_CAMPAIGN : BRICK_CAMPAIGN;
