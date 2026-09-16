"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "./gsap-setup";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(
      { reduced: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" },
      (context) => {
        const { reduced } = context.conditions as { reduced: boolean };

        if (reduced) {
          el.textContent = `${prefix}${value}${suffix}`;
          return;
        }

        const counter = { n: 0 };
        gsap.to(counter, {
          n: value,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(counter.n)}${suffix}`;
          },
        });
      },
    );

    return () => mm.revert();
  }, [value, suffix, prefix, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
