"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "./gsap-setup";

/**
 * Subtle enter transition on every client-side navigation. The App Router
 * swaps content before an exit animation could run, so this focuses on a
 * clean, fast reveal of the new page rather than faking a two-phase
 * transition — the loader on first load already covers the "leaving" moment.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
    );
  }, [pathname]);

  return (
    <div ref={containerRef} key={pathname}>
      {children}
    </div>
  );
}
