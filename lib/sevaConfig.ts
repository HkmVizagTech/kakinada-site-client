export interface SevaTier {
  label: string;
  amount: number;
}

// A seva priced per countable unit (a Gita, a plate, a brick). Lets an
// arbitrary custom amount be translated into the impact it funds.
export interface SevaUnit {
  /** Cost of one unit, in rupees. */
  price: number;
  singular: string;
  plural: string;
}

// Human-readable impact of an arbitrary amount — e.g. ₹500 on Gita Daan reads
// "Supports 2 Gitas". Returns null when the seva isn't priced per unit or the
// amount doesn't cover a single one.
export function unitImpact(amount: number, unit?: SevaUnit, bare = false): string | null {
  if (!unit || !Number.isFinite(amount) || amount < unit.price) return null;
  const count = Math.floor(amount / unit.price);
  const label = `${count.toLocaleString("en-IN")} ${count === 1 ? unit.singular : unit.plural}`;
  return bare ? label : `Supports ${label}`;
}

export interface Seva {
  slug: string;
  title: string;
  shortTitle: string; // used in "Sponsor X" button
  image: string;
  tagline: string;
  description: string;
  tiers: SevaTier[];
  // Set when the seva is priced per countable unit, so a custom amount can be
  // shown as the impact it funds (see unitImpact).
  unit?: SevaUnit;
  category: string; // used for DCC / receipt categorization
  account: "default" | "donations";
  icon: string;
  // If set, every link to this seva (homepage cards, cross-links on other
  // seva pages, the donation hub) points here instead of /donate/[slug].
  // Used for Square Foot Seva, which has a richer dedicated campaign page
  // with live goal progress and peer-to-peer fundraising.
  externalHref?: string;
  // Optional dedicated hero banner (fully designed, title/CTA baked into
  // the image itself) shown at the top of /donate/[slug] instead of the
  // generic photo+overlay+heading treatment. When set, both must be set —
  // rendered responsively (desktop vs mobile) at native aspect ratio, no
  // dark overlay or duplicate heading on top since the banner already has
  // its own text.
  heroImageDesktop?: string;
  heroImageMobile?: string;
}

// Single source of truth for every seva shown on the homepage AND its
// dedicated donation page at /donate/[slug]. Add a new seva here and it
// automatically appears on the homepage grid and gets a working page.
export const sevas: Seva[] = [
  {
    slug: "anna-daan-seva",
    title: "Anna Daan Seva",
    shortTitle: "Anna Daan",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg",
    tagline: "Feed the hungry with sanctified prasadam",
    description:
      "The scriptures glorify Anna Daan as the highest of all charities. Your contribution provides freshly cooked, sanctified prasadam to devotees, students, and the underprivileged across Kakinada.",
    tiers: [
      { label: "Rs. 250 / 10 plates", amount: 250 },
      { label: "Rs. 500 / 20 plates", amount: 500 },
      { label: "Rs. 1,000 / 40 plates", amount: 1000 },
      { label: "Rs. 2,500 / 100 plates", amount: 2500 },
    ],
    category: "ANNADAAN",
    account: "default",
    icon: "🍛",
    externalHref: "/anna-daan-seva",
  },
  {
    slug: "gau-seva",
    title: "Gau Seva",
    shortTitle: "Gau Seva",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783676646237-1783676645536-ChatGPTImageJul102026031357PM.png",
    heroImageDesktop: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1784305732825-1784305730000-ChatGPTImageJul172026095835PM.png",
    heroImageMobile: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1784305706071-1784305696382-ChatGPTImageJul172026095421PM.png",
    tagline: "Support daily care for our protected cows",
    description:
      "Cows hold a sacred place in Vedic culture. Your Gau Seva donation supports fodder, medical care, and shelter for the cows in our care — an act of compassion Lord Krishna Himself cherishes.",
    tiers: [
      { label: "Rs. 1,500 / 10 cows, 1 day", amount: 1500 },
      { label: "Rs. 2,500 / medicines", amount: 2500 },
      { label: "Rs. 3,500 / 1 cow, 1 month", amount: 3500 },
      { label: "Rs. 9,000 / green grass, 1 day", amount: 9000 },
    ],
    category: "GO SEVA",
    account: "default",
    icon: "🐄",
    externalHref: "/gau-seva",
  },
  {
    slug: "gita-daan-seva",
    title: "Gita Daan Seva",
    shortTitle: "Gita Daan",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783672760162-1783672758959-ChatGPTImageJul92026043444PM.png",
    tagline: "Gift the wisdom of the Bhagavad Gita to a seeker",
    description:
      "There is no greater gift than transcendental knowledge. Sponsor copies of Bhagavad-Gita As It Is for distribution to students, prisoners, and spiritual seekers — planting a seed that can transform a life forever.",
    tiers: [
      { label: "Rs. 250 / 1 Gita", amount: 250 },
      { label: "Rs. 1,250 / 5 Gitas", amount: 1250 },
      { label: "Rs. 2,500 / 10 Gitas", amount: 2500 },
      { label: "Rs. 12,500 / 50 Gitas", amount: 12500 },
    ],
    category: "BD",
    account: "default",
    icon: "📖",
    unit: { price: 300, singular: "Gita", plural: "Gitas" },
    externalHref: "/gita-daan-seva",
  },
  {
    slug: "vastra-seva",
    title: "Vastra & Alankara Seva",
    shortTitle: "Vastra Seva",
    image: "https://pub-a141ba4729a546b29a5015432b31bd23.r2.dev/media-library/1789026585499-1789026585358-kkdassq.jpg",
    tagline: "Offer new garments and ornaments to Their Lordships",
    description:
      "Sri Sri Radha Madan Mohan are dressed and decorated fresh each day. Sponsor Vastra (garments) and Alankara (ornamentation) seva to support this daily loving service to the Deities.",
    tiers: [
      { label: "Rs. 501 / daily vastra", amount: 501 },
      { label: "Rs. 2,100 / festival vastra", amount: 2100 },
      { label: "Rs. 5,100 / alankara set", amount: 5100 },
      { label: "Rs. 11,000 / full month", amount: 11000 },
    ],
    category: "GDGD",
    account: "default",
    icon: "👘",
    externalHref: "/alankara-vastra-seva",
  },
];

export const getSevaBySlug = (slug: string) => sevas.find((s) => s.slug === slug);

// Use this everywhere a "go donate to this seva" link is built, instead of
// manually writing `/donate/${slug}` - respects externalHref when a seva has
// a richer dedicated page elsewhere on the site.
export const getSevaHref = (seva: Seva) => seva.externalHref || `/donate/${seva.slug}`;
