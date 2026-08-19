"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Ornament from "@/components/Ornament";

const FounderSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="founder" className="py-12 md:py-16 bg-white dark:bg-background">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">
            Humble Dedication
          </p>
          <Ornament className="mb-5" />
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            His Divine Grace{" "}
            <em className="font-serif-display not-italic italic text-gold">Srila Prabhupada</em>
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl bg-gradient-gold opacity-15 -rotate-3" />
              <Image
                src="https://res.cloudinary.com/ddmzeqpkc/image/upload/prabhupada_home"
                alt="Srila Prabhupada"
                width={400}
                height={500}
                className="relative rounded-2xl w-full object-cover shadow-elevated"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-3 space-y-5"
          >
            <p className="text-muted-foreground leading-relaxed">
              His Divine Grace Srila Prabhupada is the Acharya of the Hare Krishna Movement. 
              He worked relentlessly to impart knowledge, enlighten minds and establish the 
              Hare Krishna movement globally.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              As a 70-year-old, Srila Prabhupada travelled to New York with the sole purpose 
              of fulfilling his guru&apos;s dream of spreading the message of Krishna Consciousness. 
              Starting from a tiny office in New York, he went on to ignite a worldwide phenomenon.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Born on 1st September 1896 in Calcutta, he first met his spiritual master 
              Srila Bhaktisiddhanta Saraswati Goswami in 1922. In 1944, he launched 
              &apos;Back to Godhead&apos;, an English fortnightly magazine now published in forty languages 
              with monthly circulation of over a million copies.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With very little money, he convinced Sumathy Morarji to give him free passage on 
              the freight ship &apos;Jaladuta&apos;. After a grueling forty-day sea journey, he reached 
              New York City and began spreading the timeless message of Lord Krishna.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
