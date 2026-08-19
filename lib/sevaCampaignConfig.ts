import {
  UtensilsCrossed, Sparkles, FileCheck2, Landmark,
  Heart, ShieldCheck, BookOpen, Wheat, Award, Leaf, Users,
  Salad, Calendar, Droplets, Home,
} from "lucide-react";
import type { ComponentType } from "react";

export interface SevaTier {
  label: string;
  amount: number;
  description: string;
}

export interface SevaGalleryPhoto {
  src: string;
  caption: string;
}

export interface SevaUnit {
  price: number;
  singular: string;
  plural: string;
}

export interface SevaCampaignConfig {
  /** Value sent to the backend as the donation "type" (receipt category). */
  type: string;
  /** Display category used in the checkout summary. */
  category: string;
  account: "default" | "donations";
  slug: string;
  /** Canonical route of this campaign page, e.g. "/gau-seva". */
  path: string;
  pageTitle: string;
  metaTitle: string;
  metaDesc: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;

  heroTagline: string;
  heroHeading1: string;
  heroHeading2: string;
  heroDesc: string;
  /** Background for the fallback (non-banner) hero. */
  heroImage: string;
  /** Optional pre-designed banner (text baked in). When set, replaces the hero. */
  bannerImage?: string;
  bannerImageMobile?: string;
  /** Natural dimensions of bannerImage (desktop) so it renders at its true aspect ratio. */
  bannerWidth?: number;
  bannerHeight?: number;
  /** Natural dimensions of bannerImageMobile (portrait). */
  bannerMobileWidth?: number;
  bannerMobileHeight?: number;

  minCustomAmount: number;
  pricePerUnit: number;
  unitName: string;
  unitNamePlural: string;
  /** Optional per-unit pricing so a custom amount maps to a human impact. */
  unit?: SevaUnit;

  tiers: SevaTier[];
  formHeading: string;
  formSubheading: string;

  privileges: { icon: ComponentType<{ className?: string }>; title: string; text: string }[];

  about: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    image: string;
    ctaLabel: string;
  };

  impactItems: { icon: ComponentType<{ className?: string }>; title: string; text: string }[];
  features: { icon: ComponentType<{ className?: string }>; title: string; text: string }[];
  testimonials: { quote: string; name: string; role: string }[];

  gallery: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    photos: SevaGalleryPhoto[];
  };

  faqs: { q: string; a: string }[];
}

/* ------------------------------------------------------------------ */
/* Gau Seva                                                            */
/* ------------------------------------------------------------------ */

export const GAU_CAMPAIGN: SevaCampaignConfig = {
  type: "GO SEVA",
  category: "GO SEVA",
  account: "default",
  slug: "gau-seva",
  path: "/gau-seva",
  pageTitle: "Gau Seva",
  metaTitle: "Gau Seva | Hare Krishna Vaikuntham Temple, Visakhapatnam",
  metaDesc:
    "Serve the sacred cows with fodder, medicines, green grass and shelter. Sponsor daily care or adopt a cow — an act of compassion Lord Krishna Himself cherishes.",
  ogTitle: "Gau Seva — Hare Krishna Vaikuntham Temple",
  ogDesc:
    "Serve the sacred cows. Sponsor fodder, green grass, medicines and yearly adoption sevas at the Hare Krishna Vaikuntham Temple.",
  ogImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1784305732825-1784305730000-ChatGPTImageJul172026095835PM.png",

  heroTagline: "A seva initiative of Hare Krishna Movement Visakhapatnam",
  heroHeading1: "Gau Seva",
  heroHeading2: "Serve the Sacred Cows",
  heroDesc:
    "Cows hold a sacred place in Vedic culture. Your Gau Seva donation supports fodder, medical care and shelter for the cows in our care — an act of compassion Lord Krishna Himself cherishes.",
  heroImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783676646237-1783676645536-ChatGPTImageJul102026031357PM.png",
  bannerImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785586948250-1785586945893-Gau-banner-desk.webp",
  bannerImageMobile: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785586947654-1785586945558-Gau-banner-mob.webp",
  bannerWidth: 2032,
  bannerHeight: 774,
  bannerMobileWidth: 962,
  bannerMobileHeight: 1635,

  minCustomAmount: 101,
  pricePerUnit: 1500,
  unitName: "day of cow care",
  unitNamePlural: "days of cow care",
  unit: { price: 150, singular: "cow-day of care", plural: "cow-days of care" },

  tiers: [
    { label: "Feed 10 Cows for a Day", amount: 1500, description: "Fresh fodder and nutritious feed for ten cows" },
    { label: "Medicines for Cows", amount: 2500, description: "Essential medicines and veterinary care" },
    { label: "Feed a Cow for a Month", amount: 3500, description: "Complete nourishment for one cow for a month" },
    { label: "Green Grass for All Cows", amount: 9000, description: "A day of green grass for every cow in our care" },
  ],

  formHeading: "Offer Your Gau Seva",
  formSubheading:
    "Every contribution directly feeds, heals and shelters the sacred cows — service Lord Krishna Himself lovingly accepts.",

  privileges: [
    { icon: UtensilsCrossed, title: "Sanctified Prasadam", text: "Receive the Lord's prasadam from the temple as a blessing for your seva (within India)." },
    { icon: Sparkles, title: "Sankalpa & Aarti", text: "Your name is included in the sankalpa and offered during aarti to Their Lordships." },
    { icon: FileCheck2, title: "Contribution Certificate", text: "A digital certificate honouring your valued offering to the temple." },
    { icon: Landmark, title: "80G Tax Exemption", text: "Donations qualify for tax exemption under Section 80G of the Income Tax Act." },
  ],

  about: {
    eyebrow: "Why Gau Seva",
    heading: "The cow is mother to all living beings",
    paragraphs: [
      "In Vedic culture the cow is honoured as Gau Mata — a mother who gives her milk, dung and urine in service of humanity. The scriptures glorify cow protection (go-raksha) as one of the most meritorious of all services, pleasing Lord Krishna who Himself served cows as a cowherd boy in Vrindavana.",
      "Our Gau Seva programme protects and nurtures the cows in our care — providing fresh fodder, clean water, medicines, regular veterinary check-ups and loving shelter. By serving them, we serve the Lord directly.",
    ],
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783676646237-1783676645536-ChatGPTImageJul102026031357PM.png",
    ctaLabel: "Serve the Cows",
  },

  impactItems: [
    { icon: Heart, title: "Fodder & Nutrition", text: "Fresh, nutritious fodder keeps our cows healthy and content every single day." },
    { icon: ShieldCheck, title: "Medical Care", text: "Regular veterinary check-ups, vaccines and timely medicines for every cow." },
    { icon: Leaf, title: "Green Grass", text: "A daily supply of green grass — a cow's favourite meal — for all residents." },
    { icon: Home, title: "Shelter & Care", text: "A clean, loving shelter where our cows live free from fear and distress." },
  ],

  features: [
    { icon: Wheat, title: "Loving Service", text: "Cows are served with devotion as members of the temple family — never as commodities." },
    { icon: Calendar, title: "Year-Round Care", text: "Fodder, medicines and shelter are provided 365 days a year, rain or shine." },
    { icon: Award, title: "Scriptural Blessings", text: "The Vedas glorify cow protection as service that cleanses sins and pleases the Lord." },
    { icon: Users, title: "Community Service", text: "Cow milk and ghee are offered to the Deities and shared as sanctified prasadam." },
  ],

  testimonials: [
    {
      quote:
        "Sponsoring a cow for a month has brought such peace to my family. Every day I know our little offering is feeding, healing and sheltering a gentle soul in the Lord's care.",
      name: "Radhika Devi",
      role: "Gau Seva Sponsor, Visakhapatnam",
    },
    {
      quote:
        "The cows at our temple are treated with such love — you can see it in their eyes. My children love to visit them after darshan. Gau Seva has become our family's favourite service.",
      name: "Krishna Prasad",
      role: "Regular Devotee, Vizag",
    },
    {
      quote:
        "I donated medicines for the cows in my late father's name. The goshala team even sent a photo of the cows with my father's name in the sankalpa. It felt like he was still serving Krishna.",
      name: "Anjali Rao",
      role: "Donor, Hyderabad",
    },
    {
      quote:
        "Lord Krishna is known as Gopala — the protector of cows. When I understood that feeding one cow pleases Him so deeply, I began contributing monthly. It is the sweetest seva I have ever done.",
      name: "Venkatesh Iyer",
      role: "Monthly Donor, Chennai",
    },
  ],

  gallery: {
    eyebrow: "Our cows, our family",
    heading: "Glimpses of Gau Seva",
    subtitle:
      "The sacred cows in our care — fed, healed and sheltered with devotion at the Hare Krishna Vaikuntham Temple.",
    photos: [
      { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783676646237-1783676645536-ChatGPTImageJul102026031357PM.png", caption: "Our beloved Gau Mata" },
      { src: "/assets/donations-gau-seva-real.jpeg", caption: "Daily care at the goshala" },
      { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1784305732825-1784305730000-ChatGPTImageJul172026095835PM.png", caption: "Gau Seva — sacred service" },
      { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1784305706071-1784305696382-ChatGPTImageJul172026095421PM.png", caption: "Nourishing the gentle cows" },
    ],
  },

  faqs: [
    {
      q: "What is Gau Seva?",
      a: "Gau Seva is the loving service of protecting and caring for cows. In Vedic culture the cow is honoured as Gau Mata — a mother — and serving her with fodder, medicines and shelter is considered deeply pleasing to Lord Krishna.",
    },
    {
      q: "How will my donation be used?",
      a: "Your donation directly funds fresh fodder, green grass, clean water, medicines, veterinary care and shelter for the cows in our care. We are fully transparent about how every rupee is spent.",
    },
    {
      q: "Can I adopt a cow?",
      a: "Yes! Adoption sevas let you sponsor the complete yearly care of one or more cows. You will receive updates and a certificate honouring your adoption.",
    },
    {
      q: "Is my donation eligible for 80G tax exemption?",
      a: "Yes. Donations to Hare Krishna Movement qualify for tax exemption under Section 80G of the Income Tax Act. Select the '80G receipt' option during checkout and provide your PAN.",
    },
    {
      q: "Will I receive a receipt?",
      a: "Yes. An email receipt is sent automatically the moment your payment is confirmed. Your 80G certificate follows separately once your PAN is verified.",
    },
    {
      q: "Is it safe to donate online here?",
      a: "Yes. All payments are processed through Razorpay, a PCI-DSS-compliant payment gateway. We never see or store your card details. You may also donate via direct bank transfer using the details on this page.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Anna Daan Seva                                                      */
/* ------------------------------------------------------------------ */

export const ANNA_DAAN_CAMPAIGN: SevaCampaignConfig = {
  type: "ANNADAAN",
  category: "ANNADAAN",
  account: "default",
  slug: "anna-daan-seva",
  path: "/anna-daan-seva",
  pageTitle: "Anna Daan Seva",
  metaTitle: "Anna Daan Seva | Hare Krishna Vaikuntham Temple, Visakhapatnam",
  metaDesc:
    "Feed the hungry with sanctified prasadam. Sponsor meals for devotees and the underprivileged — Anna Daan is the highest form of charity in the Vedic tradition.",
  ogTitle: "Anna Daan Seva — Hare Krishna Vaikuntham Temple",
  ogDesc:
    "Feed the hungry with sanctified prasadam. Anna Daan — the donation of food — is the highest form of charity in the Vedic tradition.",
  ogImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg",

  heroTagline: "A seva initiative of Hare Krishna Movement Visakhapatnam",
  heroHeading1: "Anna Daan Seva",
  heroHeading2: "The Highest Charity",
  heroDesc:
    "Feed the hungry with sanctified prasadam. The scriptures glorify Anna Daan — the donation of food — as the highest of all charities, for it sustains life itself.",
  heroImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg",
  bannerImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785586501452-1785586500800-annadan-banner-desk.webp",
  bannerImageMobile: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785584926984-1785584925444-annadan-hero-mob.webp",
  bannerWidth: 1920,
  bannerHeight: 730,
  bannerMobileWidth: 960,
  bannerMobileHeight: 1638,

  minCustomAmount: 51,
  pricePerUnit: 25,
  unitName: "meal",
  unitNamePlural: "meals",
  unit: { price: 25, singular: "meal", plural: "meals" },

  tiers: [
    { label: "Feed 20 People", amount: 500, description: "Twenty meals for devotees and the needy" },
    { label: "Feed 40 People", amount: 1000, description: "A community table of forty prasadam plates" },
    { label: "Feed 100 People", amount: 2500, description: "One hundred sacred meals served with love" },
    { label: "Feed 200 People", amount: 5000, description: "Two hundred meals shared in the Lord's service" },
  ],

  formHeading: "Offer Your Anna Daan",
  formSubheading:
    "Every meal you sponsor is prepared as an offering to Lord Krishna and served to those who hunger — nourishing body and soul.",

  privileges: [
    { icon: UtensilsCrossed, title: "Sanctified Prasadam", text: "Receive the Lord's prasadam from the temple as a blessing for your seva (within India)." },
    { icon: Sparkles, title: "Sankalpa & Aarti", text: "Your name is included in the sankalpa and offered during aarti to Their Lordships." },
    { icon: FileCheck2, title: "Contribution Certificate", text: "A digital certificate honouring your valued offering to the temple." },
    { icon: Landmark, title: "80G Tax Exemption", text: "Donations qualify for tax exemption under Section 80G of the Income Tax Act." },
  ],

  about: {
    eyebrow: "The Glory of Anna Daan",
    heading: "Food offered to the Lord becomes His mercy",
    paragraphs: [
      "In the Vedic tradition Anna Daan is revered as the most meritorious form of charity, for food sustains life itself. Lord Krishna declares in the Bhagavad Gita that He is the fire of digestion in every living being — thus feeding someone is directly serving the Lord.",
      "Our Anna Daan programme serves wholesome, sanctified prasadam to devotees, students and the underprivileged across Visakhapatnam — every day, every festival, and during natural disasters and special occasions. Each plate is cooked with devotion in a hygienic kitchen and offered to the Lord before it reaches the one who hungers.",
    ],
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg",
    ctaLabel: "Sponsor Meals",
  },

  impactItems: [
    { icon: Heart, title: "Nourishes Bodies", text: "Wholesome, hygienic meals that truly satisfy hunger — rice, dal, vegetables and more." },
    { icon: Sparkles, title: "Feeds the Soul", text: "Prasadam is divine mercy — food blessed by the Lord that carries spiritual potency." },
    { icon: Users, title: "Serves the Needy", text: "Students, daily visitors and the underprivileged are fed with love and dignity." },
    { icon: Calendar, title: "Runs Year-Round", text: "Our kitchens serve prasadam 365 days a year, through festivals and emergencies alike." },
  ],

  features: [
    { icon: Salad, title: "Wholesome Meals", text: "Freshly cooked rice, sambar, seasonal curries, dal and buttermilk in every plate." },
    { icon: Droplets, title: "Hygienic Kitchens", text: "Prepared by trained cooks under the highest standards of cleanliness and devotion." },
    { icon: Calendar, title: "Festival Specials", text: "On festivals we add sweets and savouries so the celebration reaches everyone." },
    { icon: Users, title: "Community Tables", text: "Prasadam is shared as sacred service, building bonds of love across all walks of life." },
  ],

  testimonials: [
    {
      quote:
        "We sponsored the Sunday meal at the temple. When I saw the joy on the faces of the people being fed — especially the children — I understood the real meaning of Anna Daan.",
      name: "Madhavi Sastry",
      role: "Meal Sponsor, Visakhapatnam",
    },
    {
      quote:
        "My late grandmother always said the greatest charity is feeding the hungry. In her memory, we now sponsor meals on her tithi every year. It brings our whole family together in devotion.",
      name: "Sanjay Reddy",
      role: "Devotee, Hyderabad",
    },
    {
      quote:
        "The prasadam from this temple is truly special — you can taste the love it is cooked with. I am proud to contribute every month knowing someone is fed because of it.",
      name: "Lakshmi Narayana",
      role: "Monthly Donor, Vizag",
    },
    {
      quote:
        "Lord Krishna is the fire of digestion in every living being. Feeding a person is feeding Him. This understanding transformed how our family donates — Anna Daan is now our first choice.",
      name: "Deepa Menon",
      role: "Donor, Bengaluru",
    },
  ],

  gallery: {
    eyebrow: "Service in action",
    heading: "Anna Daan — Feeding with Love",
    subtitle:
      "Glimpses of prasadam being prepared, offered to the Lord, and served to devotees and the needy across Visakhapatnam.",
    photos: [
      { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg", caption: "Sanctified prasadam" },
      { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786100757954-1786100756855-annadan2.jpg", caption: "Meal distribution" },
      { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786100757653-1786100756788-annadan3.jpg", caption: "Serving the community" },
      { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786100757417-1786100756787-annadan4.jpg", caption: "Prasadam distribution" },
      { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786100757016-1786100756575-annadan45.jpg", caption: "Devotees at service" },
    ],
  },

  faqs: [
    {
      q: "What is Anna Daan Seva?",
      a: "Anna Daan is the donation of food — the highest form of charity in the Vedic tradition. Your contribution provides freshly cooked, sanctified prasadam to devotees, students and the underprivileged across Visakhapatnam.",
    },
    {
      q: "How many meals will my donation provide?",
      a: "Each meal costs ₹25. A donation of ₹500 feeds 20 people, ₹1,000 feeds 40, ₹2,500 feeds 100 and ₹5,000 feeds 200. Any custom amount provides a proportional number of meals.",
    },
    {
      q: "How is the prasadam prepared?",
      a: "Every meal is prepared as an offering to Lord Krishna in a hygienic temple kitchen, following strict Vedic principles of purity and devotion. The prasadam is offered to the Lord before it is served.",
    },
    {
      q: "Is my donation eligible for 80G tax exemption?",
      a: "Yes. Donations to Hare Krishna Movement qualify for tax exemption under Section 80G of the Income Tax Act. Select the '80G receipt' option during checkout and provide your PAN.",
    },
    {
      q: "Will I receive a receipt?",
      a: "Yes. An email receipt is sent automatically the moment your payment is confirmed. Your 80G certificate follows separately once your PAN is verified.",
    },
    {
      q: "Is it safe to donate online here?",
      a: "Yes. All payments are processed through Razorpay, a PCI-DSS-compliant payment gateway. We never see or store your card details. You may also donate via direct bank transfer using the details on this page.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Gita Daan Seva                                                      */
/* ------------------------------------------------------------------ */

export const GITA_DAAN_CAMPAIGN: SevaCampaignConfig = {
  type: "BD",
  category: "BD",
  account: "default",
  slug: "gita-daan-seva",
  path: "/gita-daan-seva",
  pageTitle: "Gita Daan Seva",
  metaTitle: "Gita Daan Seva | Hare Krishna Vaikuntham Temple, Visakhapatnam",
  metaDesc:
    "Gift the wisdom of the Bhagavad Gita to a seeker. Sponsor copies of Bhagavad-Gita As It Is for students, prisoners and spiritual seekers — the greatest gift of all.",
  ogTitle: "Gita Daan Seva — Hare Krishna Vaikuntham Temple",
  ogDesc:
    "There is no greater gift than transcendental knowledge. Gift Bhagavad-Gita As It Is to a seeker and plant a seed that can transform a life forever.",
  ogImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783672760162-1783672758959-ChatGPTImageJul92026043444PM.png",

  heroTagline: "A seva initiative of Hare Krishna Movement Visakhapatnam",
  heroHeading1: "Gita Daan Seva",
  heroHeading2: "The Gift of Knowledge",
  heroDesc:
    "There is no greater gift than transcendental knowledge. Sponsor copies of Bhagavad-Gita As It Is for distribution to students, prisoners and spiritual seekers — planting a seed that can transform a life forever.",
  heroImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783672760162-1783672758959-ChatGPTImageJul92026043444PM.png",
  bannerImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786195248602-1786195247509-gita-hero-desk.webp",
  bannerImageMobile: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786195247954-1786195247200-gita-hero-mob.webp",
  bannerWidth: 2032,
  bannerHeight: 774,
  bannerMobileWidth: 962,
  bannerMobileHeight: 1635,

  minCustomAmount: 101,
  pricePerUnit: 250,
  unitName: "Gita",
  unitNamePlural: "Gitas",
  unit: { price: 250, singular: "Gita", plural: "Gitas" },

  tiers: [
    { label: "1 Gita", amount: 250, description: "Place a Bhagavad Gita in one seeker's hands" },
    { label: "5 Gitas", amount: 1250, description: "Share wisdom with five spiritual seekers" },
    { label: "10 Gitas", amount: 2500, description: "A study group or classroom set" },
    { label: "50 Gitas", amount: 12500, description: "Reach a whole community of seekers" },
  ],

  formHeading: "Offer Your Gita Daan",
  formSubheading:
    "Every Gita you gift carries the transcendental knowledge of the Lord — a seed that can transform a life forever.",

  privileges: [
    { icon: UtensilsCrossed, title: "Sanctified Prasadam", text: "Receive the Lord's prasadam from the temple as a blessing for your seva (within India)." },
    { icon: Sparkles, title: "Sankalpa & Aarti", text: "Your name is included in the sankalpa and offered during aarti to Their Lordships." },
    { icon: FileCheck2, title: "Contribution Certificate", text: "A digital certificate honouring your valued offering to the temple." },
    { icon: Landmark, title: "80G Tax Exemption", text: "Donations qualify for tax exemption under Section 80G of the Income Tax Act." },
  ],

  about: {
    eyebrow: "Why Gita Daan",
    heading: "The highest gift is transcendental knowledge",
    paragraphs: [
      "Srila Prabhupada called the Bhagavad Gita 'the essence of India's spiritual wisdom.' Bhagavad-Gita As It Is — his definitive translation and commentary — has touched over 40 million lives worldwide and remains the most widely read edition of the Gita in the world.",
      "Through Gita Daan we place this sacred book into the hands of students, prisoners, hostel dwellers and sincere seekers who may never otherwise encounter it. The Gita answers life's deepest questions and gives purpose, hope and Krishna consciousness to everyone who reads it.",
    ],
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783672760162-1783672758959-ChatGPTImageJul92026043444PM.png",
    ctaLabel: "Gift a Gita",
  },

  impactItems: [
    { icon: BookOpen, title: "Transforms Lives", text: "The Gita's wisdom has guided and transformed millions of readers across the world." },
    { icon: Heart, title: "Reaches the Hopeful", text: "Students, prisoners and seekers receive the book they may never have found alone." },
    { icon: Leaf, title: "Sows a Seed", text: "Transcendental knowledge plants a seed of devotion that grows for lifetimes." },
    { icon: Users, title: "Builds Community", text: "Each Gita becomes the centre of study circles, classes and a culture of devotion." },
  ],

  features: [
    { icon: BookOpen, title: "Authentic Edition", text: "Bhagavad-Gita As It Is — the definitive translation with Srila Prabhupada's purports." },
    { icon: Award, title: "Proven Impact", text: "The most widely read edition of the Gita, treasured by seekers in 89+ languages." },
    { icon: Users, title: "Wide Reach", text: "Distributed to students, libraries, prisons, hostels and spiritual centres." },
    { icon: Heart, title: "A Personal Gift", text: "Dedicate a Gita to a loved one or to an anonymous seeker who awaits its wisdom." },
  ],

  testimonials: [
    {
      quote:
        "I was going through the darkest period of my life when someone handed me a copy of the Gita. That single book changed everything. Gita Daan is the best gift I can now give another soul.",
      name: "Ramesh Chandra",
      role: "Gita Recipient, Visakhapatnam",
    },
    {
      quote:
        "We gift Gitas on our wedding anniversary every year. There is no better way to celebrate love than sharing the book that teaches us how to love the Supreme Lord.",
      name: "Sita & Ram Mohan",
      role: "Donors, Hyderabad",
    },
    {
      quote:
        "A college student once told me the Gita his friend gifted him saved his life. It is not just a book — it is the Lord speaking to the reader. That is why we sponsor so many.",
      name: "Bhaktivedanta Das",
      role: "Devotee, Vizag",
    },
    {
      quote:
        "My grandfather distributed Gitas all his life. Carrying forward his seva gives our family immense peace — every Gita placed in a seeker's hands continues his legacy of love.",
      name: "Kavitha Sharma",
      role: "Family Donor, Chennai",
    },
  ],

  gallery: {
    eyebrow: "The book that transforms",
    heading: "Gita Daan — Sharing the Song of God",
    subtitle:
      "Bhagavad-Gita As It Is — the definitive edition of the world's most beloved scripture — ready to be placed in a seeker's hands.",
    photos: [
      { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783672760162-1783672758959-ChatGPTImageJul92026043444PM.png", caption: "Bhagavad-Gita As It Is" },
      { src: "/assets/gallery-class.jpg", caption: "Bhagavad Gita class" },
      { src: "/assets/home-event-gita-jayanti.webp", caption: "Gita Jayanti celebration" },
    ],
  },

  faqs: [
    {
      q: "What is Gita Daan Seva?",
      a: "Gita Daan is the sacred donation of Bhagavad-Gita As It Is. Your contribution places this transcendental book into the hands of students, prisoners and spiritual seekers — the greatest gift one can offer, the gift of knowledge.",
    },
    {
      q: "Which edition of the Gita is distributed?",
      a: "We distribute Bhagavad-Gita As It Is by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada — the definitive translation and commentary with Sanskrit, English translation and insightful purports. It is the most widely read edition of the Gita in the world.",
    },
    {
      q: "Can I dedicate a Gita to someone?",
      a: "Yes. You can dedicate a Gita to a loved one, in memory of someone, or to an anonymous seeker. Mention the dedication during checkout or email us at social@hkmvizag.org.",
    },
    {
      q: "Is my donation eligible for 80G tax exemption?",
      a: "Yes. Donations to Hare Krishna Movement qualify for tax exemption under Section 80G of the Income Tax Act. Select the '80G receipt' option during checkout and provide your PAN.",
    },
    {
      q: "Will I receive a receipt?",
      a: "Yes. An email receipt is sent automatically the moment your payment is confirmed. Your 80G certificate follows separately once your PAN is verified.",
    },
    {
      q: "Is it safe to donate online here?",
      a: "Yes. All payments are processed through Razorpay, a PCI-DSS-compliant payment gateway. We never see or store your card details. You may also donate via direct bank transfer using the details on this page.",
    },
  ],
};

/* ------------------------------------------------------------------ */

export const getSevaCampaignConfig = (slug: string): SevaCampaignConfig | null => {
  switch (slug) {
    case GAU_CAMPAIGN.slug:
      return GAU_CAMPAIGN;
    case ANNA_DAAN_CAMPAIGN.slug:
      return ANNA_DAAN_CAMPAIGN;
    case GITA_DAAN_CAMPAIGN.slug:
      return GITA_DAAN_CAMPAIGN;
    default:
      return null;
  }
};
