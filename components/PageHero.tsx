"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Ornament from "@/components/Ornament";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb: string;
  backgroundImage?: string;
}

const PageHero = ({ title, subtitle, breadcrumb, backgroundImage }: PageHeroProps) => {
  return (
    <section className="relative pt-20 min-h-[50vh] flex items-center overflow-hidden">
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image src={backgroundImage} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[hsl(220,60%,10%,0.7)]" />
        </div>
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-gradient-hero" />
      )}

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        {
}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-sm text-white/70 mb-6"
        >
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[hsl(var(--gold))]">{breadcrumb}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Ornament className="mb-5 text-[hsl(var(--gold))]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-heading text-4xl md:text-6xl font-bold text-white mb-4"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default PageHero;
