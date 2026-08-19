import AlankaraVastraClient from "@/components/vastra-campaign/AlankaraVastraClient";

export const metadata = {
  title: "Vastra & Alankara Seva | Hare Krishna Vaikuntham Temple, Visakhapatnam",
  description:
    "Offer beautiful garments and ornaments to Sri Sri Radha Madan Mohan. Sponsor daily vastra, festival alankara sets, and more — every offering adorns the Lord with love.",
  openGraph: {
    title: "Vastra & Alankara Seva — Hare Krishna Vaikuntham Temple",
    description:
      "Dress the Lord in splendour. Sponsor vastra and alankara seva for Sri Sri Radha Madan Mohan at the Hare Krishna Vaikuntham Temple.",
    images: ["https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677419371-1783677418690-DietyPhotos.jpeg"],
  },
};

export default function AlankaraVastraSevaPage() {
  return <AlankaraVastraClient />;
}
