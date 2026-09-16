"use client";

import { useRef, useLayoutEffect, type ReactNode } from "react";
import { gsap } from "./gsap-setup";
import { cn } from "@/lib/utils/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger the direct children instead of animating this element as one block. */
  stagger?: boolean;
  staggerAmount?: number;
  y?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
}

/** Fades + lifts content in as it enters the viewport. The core scroll-reveal primitive used across every section. */
export function Reveal({
  children,
  className,
  stagger = false,
  staggerAmount = 0.12,
  y = 28,
  delay = 0,
  duration = 0.9,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(
      { reduced: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" },
      (context) => {
        const { reduced } = context.conditions as { reduced: boolean };
        const targets = stagger ? Array.from(el.children) : el;

        if (reduced) {
          gsap.set(targets, { opacity: 1, y: 0 });
          return;
        }

        gsap.set(targets, { opacity: 0, y });
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          stagger: stagger ? staggerAmount : 0,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: once ? "play none none none" : "play none none reverse",
          },
        });
      },
    );

    return () => mm.revert();
  }, [stagger, staggerAmount, y, delay, duration, once]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
