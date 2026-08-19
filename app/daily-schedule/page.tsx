"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, Sun, Sunrise, Sunset, Moon, Music, BookOpen, Heart } from "lucide-react";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import PageHero from "@/components/PageHero";
import Ornament from "@/components/Ornament";

const schedule = [
  { time: "4:30 AM", event: "Mangala Aarti", icon: Moon, desc: "The first aarti of the day, offered in the pre-dawn hours to awaken the Lord from His divine rest." },
  { time: "5:00 AM", event: "Tulsi Puja & Japa", icon: Heart, desc: "Devotees circumambulate Tulsi Devi and chant the Hare Krishna Maha-mantra on their beads." },
  { time: "7:15 AM", event: "Shringar Darshan", icon: Sunrise, desc: "The deities are beautifully dressed and decorated for the morning darshan." },
  { time: "7:30 AM", event: "Guru Puja", icon: Music, desc: "Worship of the spiritual master with kirtan, flower offerings, and devotional songs." },
  { time: "8:00 AM", event: "Srimad Bhagavatam Class", icon: BookOpen, desc: "Daily discourse on Srimad Bhagavatam, the ripened fruit of the Vedic literature." },
  { time: "12:00 PM", event: "Raj Bhog Aarti", icon: Sun, desc: "Grand noon offering with elaborate bhog preparation for the Lord." },
  { time: "1:00 PM", event: "Prasadam Distribution", icon: Heart, desc: "Sanctified food is distributed to all visitors and devotees present." },
  { time: "4:15 PM", event: "Temple Reopens", icon: Sunset, desc: "The temple doors reopen after the Lord's afternoon rest period." },
  { time: "6:30 PM", event: "Sandhya Aarti", icon: Sunset, desc: "Evening aarti with beautiful kirtan as the sun sets — a deeply moving ceremony." },
  { time: "7:00 PM", event: "Bhagavad Gita Class", icon: BookOpen, desc: "Evening discourse on the Bhagavad Gita — the Song of God spoken by Lord Krishna." },
  { time: "8:30 PM", event: "Shayan Aarti", icon: Moon, desc: "The final aarti of the day, putting the Lord to rest for the night." },
];

const specialPrograms = [
  {
    title: "Sunday Love Feast",
    day: "Every Sunday",
    time: "5:00 PM - 8:30 PM",
    desc: "A grand weekly celebration with kirtan, discourse, and sumptuous prasadam feast open to all.",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677824913-1783677824553-Screenshot2026-07-10153331.png",
  },
  {
    title: "Ekadashi Program",
    day: "Twice a Month",
    time: "6:00 AM - 8:00 PM",
    desc: "Special fasting day programs with extended kirtan, readings from scriptures, and spiritual discussions.",
    image: "/assets/gallery-aarti.jpg",
  },
  {
    title: "Saturday Satsang",
    day: "Every Saturday",
    time: "6:00 PM - 8:00 PM",
    desc: "Community satsang with bhajans, Q&A on spiritual topics, and light prasadam.",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677824913-1783677824553-Screenshot2026-07-10153331.png",
  },
];

export default function DailySchedulePage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <PageLayout>
      <PageHero
        title="Daily Schedule"
        subtitle="Temple timings, aarti schedule & spiritual programs"
        breadcrumb="Daily Schedule"
        backgroundImage="/assets/gallery-aarti.jpg"
      />
      <section className="py-12 md:py-16 bg-white dark:bg-background" ref={ref}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Temple Timings</p>
            <Ornament className="mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Daily Program Schedule
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              The temple follows a sacred daily routine established by Srila Prabhupada for all ISKCON temples worldwide.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {schedule.map((item, i) => (
              <motion.div
                key={item.time}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-4 md:gap-6 mb-1"
              >
                <div className="w-20 md:w-24 shrink-0 text-right pt-5">
                  <span className="text-sm font-bold text-primary font-heading">{item.time}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-[hsl(var(--gold))]/40 mt-4">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  {i < schedule.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="bg-card rounded-xl border border-border p-5 hover:shadow-warm transition-shadow group">
                    <h3 className="font-heading text-lg font-semibold text-foreground">{item.event}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Weekly Programs</p>
            <Ornament className="mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Special Programs
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {specialPrograms.map((prog, i) => (
              <motion.div
                key={prog.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
                className="bg-background rounded-2xl border border-border overflow-hidden group hover:shadow-warm transition-shadow group"
              >
                <div className="h-48 overflow-hidden relative">
                  <Image
                    src={prog.image}
                    alt={prog.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-primary font-semibold mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{prog.day} · {prog.time}</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">{prog.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{prog.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-6">Visit Us</h2>
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-2">Temple Hours</h3>
                  <p className="text-sm text-muted-foreground">Mangala Darshan: 4:30 AM – 5:00 AM</p>
                  <p className="text-sm text-muted-foreground">Morning: 7:15 AM – 12:20 PM</p>
                  <p className="text-sm text-muted-foreground">Evening: 4:15 PM – 8:15 PM</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-2">Rest Period</h3>
                  <p className="text-sm text-muted-foreground">The temple is closed for darshan between 5:00 AM and 7:15 AM, and again between 12:20 PM and 4:15 PM, while the Lord rests.</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-2">Dress Code</h3>
                  <p className="text-sm text-muted-foreground">Modest, traditional attire is encouraged. Please remove footwear before entering the temple hall.</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-6">Guidelines</h2>
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-2">Photography</h3>
                  <p className="text-sm text-muted-foreground">Photography is allowed during darshan. Flash photography and video recording may be restricted during special events.</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-2">Prasadam</h3>
                  <p className="text-sm text-muted-foreground">Free prasadam is served after the morning Bhagavatam class and after the Sunday Love Feast program.</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-heading font-semibold text-foreground mb-2">Book Store</h3>
                  <p className="text-sm text-muted-foreground">Sacred literature by Srila Prabhupada, devotional items, and spiritual accessories are available at the temple bookstore.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-hero text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-white/70 text-sm tracking-[0.2em] uppercase mb-6">The Maha Mantra</p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6 leading-snug">
              Hare Krishna Hare Krishna<br />
              Krishna Krishna Hare Hare<br />
              Hare Rama Hare Rama<br />
              Rama Rama Hare Hare
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              &quot;Simply by chanting the Holy Name of the Lord, one can attain the highest perfection of life.&quot;
              <br />
              <span className="text-accent text-sm mt-2 inline-block">— Srila Prabhupada</span>
            </p>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
