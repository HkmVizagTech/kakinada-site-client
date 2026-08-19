"use client";

import PageLayout from "@/components/PageLayout";
import WhatsAppCommunityCTA from "@/components/WhatsAppCommunityCTA";
import PageHero from "@/components/PageHero";
import Ornament from "@/components/Ornament";
import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import Image from "next/image";
import { BookOpen, Globe, Award, Heart, Star, Users, Sparkles, Clock, MapPin, Ship, Landmark, GraduationCap } from "lucide-react";

const achievements = [
  { icon: Globe, value: "108+", label: "Temples Worldwide" },
  { icon: BookOpen, value: "80+", label: "Books Authored" },
  { icon: Award, value: "40+", label: "Languages Published" },
  { icon: Heart, value: "1M+", label: "Monthly Magazine Copies" },
  { icon: Users, value: "10,000+", label: "Disciples Initiated" },
  { icon: Landmark, value: "14", label: "Times Around the World" },
];

const qualities = [
  { title: "Compassion", desc: "Srila Prabhupada's heart overflowed with compassion for all living beings. He saw everyone as a spirit soul, part and parcel of Krishna." },
  { title: "Determination", desc: "At the age of 70, with nothing but faith, he crossed the ocean to fulfill his spiritual master's desire — a feat of extraordinary resolve." },
  { title: "Humility", desc: "Despite founding a worldwide movement, he always presented himself as a humble servant of his spiritual master." },
  { title: "Scholarship", desc: "He translated and commented on over 80 volumes of India's most important philosophical texts with profound depth and clarity." },
  { title: "Leadership", desc: "He built a global organization from scratch, managing thousands of devotees while maintaining the highest spiritual standards." },
  { title: "Devotion", desc: "Every moment of his life was dedicated to serving Lord Krishna. His personal example of devotion inspired millions worldwide." },
];

const facts = [
  "Srila Prabhupada translated over 60 volumes of Vedic literature, including the Bhagavad-gita, Srimad-Bhagavatam, and Chaitanya Charitamrita.",
  "He circled the globe 14 times in the last 11 years of his life, despite his advanced age.",
  "His books have been translated into 89 languages and distributed in hundreds of millions of copies.",
  "He established 108 temples across six continents in just 11 years.",
  "He initiated over 10,000 disciples during his lifetime.",
  "He introduced the Ratha Yatra festival to cities around the world.",
  "He recorded over 1,500 hours of lectures, conversations, and morning walks.",
  "He established farm communities for simple living and high thinking.",
  "His books are used as standard textbooks in numerous university courses around the world.",
  "He introduced Vedic cuisine (prasadam) to the Western world, establishing vegetarian restaurants globally.",
];

const timeline = [
  { year: "1896", title: "Birth", desc: "Born on September 1st in Calcutta (now Kolkata) as Abhay Charan De, on the auspicious day after Janmashtami.", icon: Star },
  { year: "1916", title: "Graduation", desc: "Completed graduation from Scottish Church College in Calcutta with a degree in English, Philosophy, and Economics.", icon: GraduationCap },
  { year: "1922", title: "Meeting Spiritual Master", desc: "First meeting with His Divine Grace Srila Bhaktisiddhanta Saraswati Goswami Maharaja in Calcutta, who urged him to spread Vedic knowledge in the English language.", icon: Heart },
  { year: "1933", title: "Formal Initiation", desc: "Formally initiated as Abhay Charanaravinda Das by Srila Bhaktisiddhanta Saraswati at Allahabad. Received the instruction to spread Krishna consciousness in English.", icon: Award },
  { year: "1944", title: "Back to Godhead", desc: "Single-handedly launched 'Back to Godhead' magazine — writing, editing, printing, and distributing it himself. The magazine continues to this day in over 40 languages.", icon: BookOpen },
  { year: "1947", title: "Title of Bhaktivedanta", desc: "Honored with the title 'Bhaktivedanta' by the Gaudiya Vaisnava Society in recognition of his deep realization and scholarly presentation of Vedic knowledge.", icon: Award },
  { year: "1950", title: "Vanaprastha", desc: "At age 54, retired from married life and moved to the historic Radha-Damodara temple in Vrindavan, beginning intensive study and writing.", icon: Landmark },
  { year: "1959", title: "Sannyasa", desc: "Accepted the renounced order of life (sannyasa) and began publishing the Srimad-Bhagavatam with English translations and elaborate purports.", icon: Sparkles },
  { year: "1965", title: "Journey to America", desc: "At age 69, boarded the cargo ship Jaladuta with just 40 rupees and a trunk of books. After a 35-day voyage, arrived in New York City to begin his world mission.", icon: Ship },
  { year: "1966", title: "ISKCON Founded", desc: "Established the International Society for Krishna Consciousness (ISKCON) in New York City with a handful of followers in a small storefront.", icon: Globe },
  { year: "1968", title: "New Vrindavan", desc: "Established the first Hare Krishna farm community in West Virginia, embodying the ideal of simple living and high thinking.", icon: MapPin },
  { year: "1970", title: "GBC Formed", desc: "Established the Governing Body Commission (GBC) to manage the worldwide affairs of ISKCON, ensuring the movement's continuity.", icon: Users },
  { year: "1972", title: "Bhagavad-gita As It Is", desc: "Published the complete edition of Bhagavad-gita As It Is through Macmillan Publishers. It became the most widely read edition of the Gita in the world.", icon: BookOpen },
  { year: "1975", title: "World Tours", desc: "Continued extensive world tours, opening temples in major cities across Africa, South America, and Asia. Over 100 centers operating worldwide.", icon: Globe },
  { year: "1977", title: "Departure", desc: "On November 14th, at the Krishna-Balarama Mandir in Vrindavan, Srila Prabhupada departed this world, leaving behind a legacy that continues to transform millions of lives.", icon: Star },
];

const teachings = [
  { title: "Bhagavad-gita As It Is", desc: "The definitive translation and commentary on the Bhagavad Gita, the Song of God. Over 40 million copies distributed, making it the most widely read edition worldwide." },
  { title: "Srimad-Bhagavatam", desc: "An 18,000-verse magnum opus with translations and illuminating purports spanning 30 volumes, revealing the complete science of God realization." },
  { title: "Sri Chaitanya-charitamrita", desc: "A 17-volume translation of the biography of Lord Chaitanya Mahaprabhu, the golden avatar who inaugurated the congregational chanting movement 500 years ago." },
  { title: "The Nectar of Devotion", desc: "A summary study of Rupa Gosvami's Bhakti-rasamrita-sindhu, explaining the complete science of bhakti yoga in accessible language." },
  { title: "Back to Godhead Magazine", desc: "The flagship publication first started in 1944 in Delhi. Now published monthly in over 40 languages with circulation exceeding one million copies." },
  { title: "The Science of Self-Realization", desc: "A collection of articles and interviews presenting Vedic philosophy for the modern audience, addressing fundamental questions of human existence." },
];

const SectionHeader = ({ label, title }: { label: string; title: string }) => (
  <div className="text-center mb-16">
    <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">{label}</p>
            <Ornament className="mb-5" />
    <h2 className="text-3xl md:text-5xl font-bold text-foreground">{title}</h2>
  </div>
);

const AnimatedSection = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function FounderPage() {
  return (
    <PageLayout>
      <PageHero
        title="His Divine Grace Srila Prabhupada"
        subtitle="Founder-Acharya of the Worldwide Hare Krishna Movement"
        breadcrumb="About Founder"
      />

     
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 items-start">
              <div className="md:col-span-2">
                <div className="relative sticky top-28">
                  <div className="absolute -inset-3 bg-primary/10 rounded-2xl -rotate-3" />
                  <Image
                    src="https://res.cloudinary.com/ddmzeqpkc/image/upload/prabhupada_home"
                    alt="Srila Prabhupada"
                    width={400}
                    height={500}
                    className="relative rounded-2xl w-full object-cover shadow-elevated"
                  />
                  <div className="mt-6 p-4 bg-card rounded-xl border border-border text-center">
                    <p className="text-sm font-semibold text-foreground">A.C. Bhaktivedanta Swami Prabhupada</p>
                    <p className="text-xs text-muted-foreground mt-1">1 September 1896 — 14 November 1977</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 space-y-6">
                <p className="text-gold text-sm tracking-[0.2em] uppercase font-medium">About Srila Prabhupada</p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  The Acharya Who Changed the World
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  His Divine Grace A.C. Bhaktivedanta Swami Prabhupada is the Founder-Acharya of the International Society for Krishna Consciousness (ISKCON) and the greatest ambassador of Vedic knowledge the world has ever seen. He transformed the spiritual landscape of the modern world by single-handedly carrying India&apos;s ancient wisdom to every continent.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Born on September 1, 1896, in Calcutta, one day after the auspicious festival of Janmashtami, Abhay Charan De showed early signs of spiritual inclination. His father, Gour Mohan De, raised him as a pure Vaishnava devotee. As a child, Abhay organized his own Ratha Yatra festivals, imitating the famous Jagannath procession.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  In 1922, he had a life-changing encounter with his spiritual master, Srila Bhaktisiddhanta Saraswati Goswami, who recognized his potential and instructed him to spread the message of Lord Chaitanya in the English language. This instruction became the guiding force of his entire life.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  After decades of preparation — studying, writing, and cultivating deep spiritual realization — Srila Prabhupada embarked on an unprecedented mission at the age of 69. With nothing but his faith, a trunk of books, and forty rupees, he boarded the cargo ship Jaladuta and set sail for America. The 35-day voyage nearly claimed his life when he suffered two heart attacks, but he was sustained by the grace of Lord Krishna.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Arriving in New York City in September 1965, he began humbly — chanting under a tree in Tompkins Square Park and giving talks in a tiny storefront on the Lower East Side. Within just eleven years, he built a worldwide confederation of more than 108 temples, rural communities, schools, and restaurants, transforming the lives of thousands.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

     
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {achievements.map((a) => (
              <AnimatedSection key={a.label}>
                <div className="text-center">
                  <a.icon className="w-8 h-8 text-white/70 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{a.value}</div>
                  <p className="text-xs text-white/70">{a.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

     
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <SectionHeader label="Divine Qualities" title="The Qualities of a Pure Devotee" />
          </AnimatedSection>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {qualities.map((q) => (
              <AnimatedSection key={q.title}>
                <div className="bg-background rounded-2xl p-6 border border-border hover:shadow-warm hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-gradient-gold">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{q.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{q.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

     
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <SectionHeader label="Milestone Timeline" title="A Life of Extraordinary Devotion" />
          </AnimatedSection>
          <div className="max-w-4xl mx-auto relative">
           
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-0.5" />

            {timeline.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <AnimatedSection key={item.year}>
                  <div className={`relative flex items-start mb-12 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
                   
                    <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-[hsl(var(--gold))] border-4 border-background -translate-x-2 md:-translate-x-2 z-10 mt-1" />

                   
                    <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                      <span className="text-primary font-bold text-sm">{item.year}</span>
                      <h3 className="text-lg font-bold text-foreground mt-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <SectionHeader label="Amazing Facts" title="Facts About Srila Prabhupada" />
          </AnimatedSection>
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
            {facts.map((fact, i) => (
              <AnimatedSection key={i}>
                <div className="flex gap-4 p-5 bg-background rounded-xl border border-border hover:border-primary/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-sm">{i + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{fact}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

     
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <SectionHeader label="Sacred Literature" title="Timeless Teachings" />
          </AnimatedSection>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachings.map((t) => (
              <AnimatedSection key={t.title}>
                <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-warm transition-shadow h-full">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

     
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <AnimatedSection>
            <p className="text-white/60 text-sm tracking-[0.2em] uppercase mb-6">His Words</p>
            <blockquote className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-6">
              &quot;I am not this body. I am a spirit soul, part and parcel of the Supreme Lord. My real business is to serve Him with love and devotion.&quot;
            </blockquote>
            <p className="text-white/70 font-medium">— Srila Prabhupada</p>
          </AnimatedSection>
        </div>
      </section>
      <WhatsAppCommunityCTA />
    </PageLayout>
  );
}
