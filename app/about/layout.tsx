import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "About ISKCON Visakhapatnam (Hare Krishna Movement, Gambheeram) — our history, founder-acharya Srila Prabhupada, and our mission since 2008.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
