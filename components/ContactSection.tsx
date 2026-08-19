"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Ornament from "@/components/Ornament";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

const DEFAULT_CONTACT = {
  phone: "",
  email: "",
  address: "ISKCON Kakinada, Kakinada, Andhra Pradesh",
  morningHours: "4:30 AM - 1:00 PM",
  eveningHours: "4:00 PM - 8:30 PM",
};

const ContactSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorization, setAuthorization] = useState(false);
  const [contact, setContact] = useState(DEFAULT_CONTACT);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/site-content`);
        if (res.ok) {
          const data = await res.json();
          if (data.content?.contact) {
            setContact({ ...DEFAULT_CONTACT, ...data.content.contact });
          }
        }
      } catch {}
    })();
  }, []);

  const contactInfo = [
    { icon: MapPin, title: "Address", details: [contact.address] },
    { icon: Phone, title: "Phone", details: [contact.phone] },
    { icon: Mail, title: "Email", details: [contact.email] },
    { icon: Clock, title: "Temple Hours", details: [`Morning: ${contact.morningHours}`, `Evening: ${contact.eveningHours}`] },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorization) {
      toast({
        title: "Authorization required",
        description: "Please authorize us to send you SMS / promotional / informational messages.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: "Homepage Contact Form",
          message: formData.message,
          authorization,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast({ title: "Message Sent!", description: "Hare Krishna! We'll respond soon." });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setAuthorization(false);
    } catch {
      toast({
        title: "Couldn't send message",
        description: "Please try again, or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 md:py-16 bg-white dark:bg-background">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Contact</p>
          <Ornament className="mb-5" />
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
            Get in Touch
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions or want to know more about our activities? We&apos;d love to hear from you.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="group flex gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-gradient-gold">
                  <info.icon className="h-5 w-5 text-primary transition-colors group-hover:text-[hsl(220,60%,12%)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                  {info.details.map((detail) => (
                    <p key={detail} className="text-sm text-muted-foreground">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border space-y-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background"
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background"
                />
                <Textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="bg-background resize-none"
                />
              </div>

              <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  checked={authorization}
                  onCheckedChange={(v) => setAuthorization(!!v)}
                  className="mt-0.5"
                  required
                />
                <span>
                  I hereby authorize to send the notifications on SMS / Messages / Promotional / Informational Messages
                </span>
              </label>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-gold text-[hsl(220,60%,12%)] font-bold shadow-gold hover:opacity-90"
              >
                {isSubmitting ? "Sending..." : (<>Send Message <Send className="w-4 h-4 ml-2" /></>)}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
