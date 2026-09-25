"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "./gsap-setup";

/** Thin fixed progress bar tracking scroll position through the full document. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress });
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-70 h-[2px] bg-transparent">
      <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-blue-500" />
    </div>
  );
}
