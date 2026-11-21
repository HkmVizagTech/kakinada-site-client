// Runtime configuration and the content that stays the same every year for Kartika Vanabhojanam.
// The date, venue, fees and age range of each edition are created in the admin console (Events)
// and loaded from the backend, so a new year only needs a new event there.

export const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

/** Prefix of every Vanabhojanam endpoint on the temple server. */
export const VB_API = `${API_URL}/vanabhojanam`;

export const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://iskconkakinada.org").replace(/\/+$/, "");

export const BASE_PATH = "/vanabhojanam";

export const EVENT = {
  name: "Kartika Vanabhojanam",
  title: "Kartika Vanabhojanam",
  tagline: "A Day With Nature & Divine",
  organiser: "ISKCON Kakinada",
  organiserFull: "Hare Krishna Movement, Kakinada",
  city: "Kakinada",
  contact: {
    email: "social@hkmvizag.org",
    phone: "+919154690221",
    phoneLabel: "+91 91546 90221",
  },
  registrationUrl: `${SITE_URL}${BASE_PATH}`,
} as const;

export type FigureName = "book" | "ball" | "mridanga" | "thali" | "pass" | "lotus";

export const HIGHLIGHTS: { id: string; figure: FigureName; title: string; text: string }[] = [
  {
    id: "talk",
    figure: "book",
    title: "Spiritual Talk",
    text: "Timeless wisdom of the Bhagavad-gita, shared in a way that speaks to young minds.",
  },
  {
    id: "games",
    figure: "ball",
    title: "Games",
    text: "Team games and friendly challenges under open skies.",
  },
  {
    id: "dance",
    figure: "mridanga",
    title: "Ecstatic Dances",
    text: "Kirtan to the beat of the mridanga, where everyone is invited to sing and dance.",
  },
  {
    id: "prasadam",
    figure: "thali",
    title: "Delicious Prasadam",
    text: "A wholesome vegetarian feast, offered to Krishna and shared with love.",
  },
];

export const COLLEGE_YEARS = [
  { value: "1", label: "1st" },
  { value: "2", label: "2nd" },
  { value: "3", label: "3rd" },
  { value: "4", label: "4th" },
];

export const MAHAMANTRA = {
  roman: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare · Hare Rama Hare Rama Rama Rama Hare Hare",
  devanagari: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे । हरे राम हरे राम राम राम हरे हरे ॥",
};

// Content for the "What is Vanabhojanam?" section.
export const VANABHOJANA = {
  title: "What is Vanabhojanam?",
  lead:
    "Vana means forest and bhojana means meal. In the Srimad-Bhagavatam (Canto 10), young Krishna takes His cowherd friends and their calves into the forest, plays all morning, and then everyone sits down together to share lunch.",
  steps: [
    {
      title: "Into the forest",
      text: "At dawn Krishna and His friends gather the calves and head out to the green pastures and groves.",
    },
    {
      title: "Play and laughter",
      text: "They race, sing, imitate the birds and swing from the branches, a whole morning of joy in nature.",
    },
    {
      title: "A circle around Krishna",
      text: "When hunger comes, the boys sit in a circle with Krishna in the middle, like petals around the centre of a lotus.",
    },
    {
      title: "Sharing the meal",
      text: "Each friend opens his lunch, offers a taste to Krishna and shares with the others, laughing and joking together.",
    },
  ],
  points: [
    "A day in nature, away from screens, with friends who lift you up.",
    "Simple, joyful, shared food offered with devotion.",
    "Music, laughter and stories in the spirit of the forest lunch.",
  ],
  closing:
    "Our Vanabhojanam brings that same spirit to Kakinada: come as you are, eat together, play together, sing together.",
};

// Pictures live in /public so the page does not depend on another temple's bucket.
export const IMAGES = {
  forest: "/vanabhojanam/forest-v1.webp",
  meal: "/vanabhojanam/meal-v1.webp",
  logo: "/vanabhojanam/logo.svg",
};
