"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "./gsap-setup";

const SESSION_KEY = "leotech_loaded";

/** One-time premium loading screen shown on the first page load of a session — never on client-side navigation. */
export function PageLoader() {
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // storage unavailable (private mode etc.) — just show it once, harmlessly
    }
    if (!alreadyShown) {
      setVisible(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tl = gsap.timeline({
      onComplete: () => setVisible(false),
    });

    if (reducedMotion) {
      tl.to(root, { opacity: 0, duration: 0.2, delay: 0.1 });
      return () => {
        tl.kill();
      };
    }

    tl.fromTo(
      root.querySelector(".loader-logo"),
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
    )
      .to(bar, { width: "100%", duration: 0.7, ease: "power2.inOut" }, "-=0.15")
      .to(root, { opacity: 0, duration: 0.45, ease: "power2.inOut", delay: 0.1 });

    return () => {
      tl.kill();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-navy-900"
      aria-hidden
    >
      <img src="/brand/leotech-logo-light.svg" alt="" className="loader-logo h-16 w-16" />
      <div className="h-px w-40 overflow-hidden bg-white/10">
        <div ref={barRef} className="h-full w-0 bg-blue-500" />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
        Loading Systems
      </p>
    </div>
  );
}
