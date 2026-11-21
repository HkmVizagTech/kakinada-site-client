"use client";

import { Children, type ElementType, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Fades + lifts its children into view on scroll. With `stagger`, each direct child animates in turn

 * Content stays visible when motion is reduced.
 */
export default function Reveal({
  children,
  y = 28,
  stagger = 0,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  y?: number;
  stagger?: number;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const reduced = useReducedMotion();
  const transition = (i: number) => ({ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay: delay + i * stagger });
  const view = { once: true, margin: "0px 0px -12% 0px" } as const;

  if (reduced) return <Tag className={className}>{children}</Tag>;

  if (stagger) {
    return (
      <Tag className={className}>
        {Children.toArray(children).map((child, i) => (
          <motion.div key={i} className="h-full" initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={view} transition={transition(i)}>
            {child}
          </motion.div>
        ))}
      </Tag>
    );
  }

  const MotionTag = motion.create(Tag as any) as any;
  return (
    <MotionTag className={cn(className)} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={view} transition={transition(0)}>
      {children}
    </MotionTag>
  );
}
