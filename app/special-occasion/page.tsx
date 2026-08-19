import SpecialOccasionClient from "./SpecialOccasionClient";

export const metadata = {
  title: "Special Occasion Seva | Hare Krishna Vaikuntham Temple, Visakhapatnam",
  description:
    "Celebrate a birthday, anniversary, or any special day by sponsoring a seva at the Hare Krishna Vaikuntham Temple. Receive blessings from Sri Sri Radha Madan Mohan, 80G tax exemption, and mahaprasadam.",
  openGraph: {
    title: "Special Occasion Seva — Hare Krishna Vaikuntham Temple",
    description:
      "Mark your special day with a heartfelt act of seva and receive blessings from Sri Sri Radha Madan Mohan.",
    images: [
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1784005845291-1784005844212-ChatGPTImageJul142026104033AM.png",
    ],
  },
};

export default function SpecialOccasionPage() {
  return <SpecialOccasionClient />;
}
