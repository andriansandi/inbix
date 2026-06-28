import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Section({ id, children, className }: SectionProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}
