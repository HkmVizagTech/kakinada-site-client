"use client";

import PageLayout from "@/components/PageLayout";
import WhatsAppCommunityCTA from "@/components/WhatsAppCommunityCTA";
import PageHero from "@/components/PageHero";
import Ornament from "@/components/Ornament";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, BookOpen, Users, Flower2, Globe, Calendar, Music, GraduationCap, ExternalLink } from "lucide-react";
import Image from "next/image";
import AssociatedTrustsImg from "@/assets/AssociatedTrusts.png";

const values = [
  { icon: Heart, title: "Spiritual Well-being", desc: "Programs designed to nurture the soul and bring inner peace through the teachings of Bhagavad Gita and Srimad Bhagavatam." },
  { icon: BookOpen, title: "Vedic Wisdom", desc: "Deep dive into ancient scriptures to derive practical insights that address modern life's questions and challenges." },
  { icon: Users, title: "Community Service", desc: "Dedicated to feeding the needy, educating the young, and serving society with compassion and devotion." },
  { icon: Flower2, title: "Value Education", desc: "Inculcating timeless values in children through interactive programs, summer camps, and cultural activities." },
];

const activities = [
  { icon: Calendar, title: "Daily Programs", desc: "Morning and evening aartis, kirtan sessions, and Bhagavad Gita classes open to all." },
  { icon: Music, title: "Kirtan & Bhajans", desc: "Soul-stirring musical sessions that connect hearts to the divine through devotional singing." },
  { icon: GraduationCap, title: "Youth Programs", desc: "Engaging sessions for college students covering personality development, stress management, and spiritual growth." },
  { icon: Globe, title: "Cultural Festivals", desc: "Grand celebrations of Janmashtami, Gaura Purnima, Ratha Yatra, and other Vaishnava festivals." },
];

const milestones = [
  { year: "2008", event: "Began humble seva activities in Visakhapatnam" },
  { year: "2015", event: "Registered as a trust in Visakhapatnam" },
  { year: "2016", event: "Began regular Bhagavad Gita study circles" },
  { year: "2018", event: "Launched Subhojanam food distribution programme" },
  { year: "2019", event: "Expanded to serve 500+ meals daily at KGH Hospital" },
  { year: "2021", event: "Extended food service to GGH Hospital, Kakinada" },
  { year: "2023", event: "Announced Hare Krishna Vaikuntham Temple project" },
];

const trusts = [
  {
    name: "ISKCON Gambheeram Visakhapatnam",
    description: "The parent body — Srila Prabhupada's ISKCON temple at Gambheeram, Visakhapatnam. All associated trusts and initiatives operate under its spiritual and institutional umbrella.",
    role: "Parent Organisation",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
  },
  {
    name: "Hare Krishna Movement India",
    description: "The registered trust through which ISKCON Gambheeram conducts its spiritual, cultural, and educational programmes in Visakhapatnam.",
    role: "Spiritual & Cultural Activities",
    color: "from-gold/20 to-gold/5",
    border: "border-gold/30",
  },
  {
    name: "Touchstone Charities",
    description: "Runs the Subhojanam hospital meal programme, providing free nutritious meals to patients and attendants at government hospitals in Visakhapatnam and Kakinada.",
    role: "Charitable & Welfare Activities",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    link: "/subhojanam",
    linkLabel: "View Subhojanam →",
  },
  {
    name: "Touchstone Foundation",
    description: "Focuses on education, skill development, and social welfare initiatives under the broader umbrella of HKM Visakhapatnam.",
    role: "Education & Welfare",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
  },
  {
    name: "HKM Charitable Foundation AP",
    description: "Supports various charitable activities across Andhra Pradesh, extending the reach of Hare Krishna Movement's service activities beyond Visakhapatnam.",
    role: "State-wide Charitable Activities",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
  },
  {
    name: "Akshaya Patra (Partner)",
    description: "ISKCON Gambheeram is associated with the Akshaya Patra Foundation — the world's largest mid-day meal programme, feeding over 2 million schoolchildren daily.",
    role: "School Mid-day Meal Programme",
    color: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30",
  },
];

export default function AboutPage() {
  const ref1 = useRef(null); const ref2 = useRef(null);
  const ref3 = useRef(null); const ref4 = useRef(null);
  const ref5 = useRef(null);
  const inView1 = useInView(ref1, { once: true, margin: "-80px" });
  const inView2 = useInView(ref2, { once: true, margin: "-80px" });
  const inView3 = useInView(ref3, { once: true, margin: "-80px" });
  const inView4 = useInView(ref4, { once: true, margin: "-80px" });
  const inView5 = useInView(ref5, { once: true, margin: "-80px" });

  return (
    <PageLayout>
      <PageHero
        title="About Us"
        subtitle="Spreading the timeless message of Lord Krishna through devotion, service, and community"
        breadcrumb="About Us"
        backgroundImage="/assets/about-community.jpg"
      />

      {/* ── OUR STORY ─────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white dark:bg-background" ref={ref1}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={inView1 ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
              <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Our Story</p>
              <Ornament className="mb-5 !justify-start" />
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">A Legacy of Devotion & Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Over five hundred years ago, Lord Sri Chaitanya made a prophecy that every town and village
                of the world would chant the holy name of Lord Krishna. In September 1965, His Divine
                Grace A.C. Bhaktivedanta Swami Prabhupada left the shores of India to fulfill this prophecy.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Following in the footsteps of our revered Founder-Acharya, we at{" "}
                <strong className="text-foreground">Hare Krishna Movement India (HKMI), Visakhapatnam</strong> —
                also known as <strong className="text-foreground">ISKCON Gambheeram Visakhapatnam</strong> —
                have been conducting spiritual, educational and cultural activities with the devoted purpose
                of bringing about physical, emotional and spiritual well-being.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Serving the community since 2008 and registered as a trust in 2015, HKMI&apos;s
                activities have grown consistently, touching thousands of lives across Visakhapatnam and beyond.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={inView1 ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
              <Image src="/assets/about-community.jpg" alt="Community gathering" width={600} height={400} className="rounded-2xl shadow-elevated w-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ───────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white dark:bg-background" ref={ref2}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={inView2 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center mb-16">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">What We Stand For</p>
            <Ornament className="mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Our Core Values</h2>
          </motion.div>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8">
            {values.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} animate={inView2 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }} className="flex gap-5 bg-background p-6 rounded-2xl border border-border hover:shadow-warm transition-shadow group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-gradient-gold">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTIVITIES ────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white dark:bg-background" ref={ref3}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={inView3 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center mb-16">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">What We Do</p>
            <Ornament className="mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Our Activities</h2>
          </motion.div>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} animate={inView3 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }} className="bg-card p-6 rounded-2xl border border-border text-center hover:shadow-warm transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 transition-colors group-hover:bg-gradient-gold">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MILESTONES ────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white dark:bg-background" ref={ref4}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={inView4 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center mb-16">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Our Journey</p>
            <Ornament className="mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Key Milestones</h2>
          </motion.div>
          <div className="max-w-2xl mx-auto space-y-0">
            {milestones.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={inView4 ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }} className="flex gap-6 items-start relative pb-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-[hsl(220,60%,12%)] font-bold text-xs shrink-0">{m.year}</div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                </div>
                <div className="bg-background rounded-xl p-4 border border-border flex-1 mt-1">
                  <p className="text-foreground font-medium">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ASSOCIATED TRUSTS ─────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white dark:bg-background" ref={ref5}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={inView5 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center mb-4">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Our Ecosystem</p>
            <Ornament className="mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Associated Trusts & Initiatives</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ISKCON Gambheeram Visakhapatnam operates through several trusts and partner organisations,
              each focused on a specific area of service — from hospital meals and education to state-wide
              charitable activities. All are guided by the same spiritual mission.
            </p>
          </motion.div>

          {/* Visual diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={inView5 ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.8, delay: 0.2 }}
            className="my-12 flex justify-center"
          >
            <Image
              src={AssociatedTrustsImg}
              alt="Associated Trusts of ISKCON Gambheeram Visakhapatnam"
              width={700} height={900}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-elevated"
            />
          </motion.div>

          {/* Trust cards */}
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trusts.map((trust, i) => (
              <motion.div
                key={trust.name}
                initial={{ opacity: 0, y: 20 }} animate={inView5 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                className={`flex flex-col rounded-2xl border bg-gradient-to-br p-5 ${trust.color} ${trust.border}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{trust.role}</span>
                <h3 className="font-heading text-base font-bold text-foreground mb-2">{trust.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{trust.description}</p>
                {trust.link && (
                  <a href={trust.link} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    {trust.linkLabel} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={inView5 ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}
            className="text-center text-sm text-muted-foreground mt-10 max-w-2xl mx-auto"
          >
            <strong className="text-foreground">Note:</strong> Hare Krishna Movement India and ISKCON Gambheeram Visakhapatnam
            are the same organisation — ISKCON is the global name, while HKM India is the registered legal entity
            in India through which all activities are conducted.
          </motion.p>
        </div>
      </section>
      <WhatsAppCommunityCTA />
    </PageLayout>
  );
}
