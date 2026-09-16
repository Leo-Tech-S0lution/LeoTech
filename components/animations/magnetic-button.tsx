"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "./gsap-setup";

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/** Wraps interactive elements with a subtle magnetic pull toward the cursor. Desktop (fine-pointer) only. */
export function MagneticButton({ children, strength = 0.35, className }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.5,
      ease: "power3.out",
    });
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </div>
  );
}
