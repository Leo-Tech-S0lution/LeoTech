"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "./gsap-setup";

/** Premium custom cursor: small dot + trailing ring, expands over interactive elements. Desktop only. */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(isFinePointer && !reducedMotion);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const ringPos = { x: 0, y: 0 };
    let raf = 0;

    function onMouseMove(e: MouseEvent) {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      ringPos.x = e.clientX;
      ringPos.y = e.clientY;
    }

    function loop() {
      gsap.to(ring, { x: ringPos.x, y: ringPos.y, duration: 0.35, ease: "power3.out" });
      raf = requestAnimationFrame(loop);
    }

    const interactiveSelector =
      "a, button, [role='button'], input, textarea, select, .cursor-interactive";

    // Delegate from document so elements added after client-side navigation
    // (new pages, admin tables, etc.) are picked up without re-binding.
    function onPointerOver(e: PointerEvent) {
      if ((e.target as Element)?.closest?.(interactiveSelector)) {
        gsap.to(ring, { scale: 2.2, duration: 0.3, ease: "power2.out" });
        gsap.to(dot, { scale: 0, duration: 0.2 });
      }
    }

    function onPointerOut(e: PointerEvent) {
      const related = e.relatedTarget as Element | null;
      if (related?.closest?.(interactiveSelector)) return;
      gsap.to(ring, { scale: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-blue-500"
        aria-hidden
      />
      <div
        ref={ringRef}
        className="cursor-ring h-8 w-8 -translate-x-1/2 -translate-y-1/2 border border-blue-500/60"
        aria-hidden
      />
    </>
  );
}
