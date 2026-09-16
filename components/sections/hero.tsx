"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { gsap } from "@/components/animations/gsap-setup";
import { TechBackground } from "@/components/patterns/tech-background";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/lib/db/schema";

const FLOATING_LABELS = [
  { label: "AI / ML", top: "18%", left: "8%" },
  { label: "IoT NETWORK", top: "28%", right: "6%" },
  { label: "CLOUD READY", top: "68%", left: "5%" },
  { label: "SECURE SYSTEM", top: "72%", right: "9%" },
];

interface HeroProps {
  slides: HeroSlide[];
  fallbackTitle: string;
  fallbackDescription: string;
}

export function Hero({ slides, fallbackTitle, fallbackDescription }: HeroProps) {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const hasSlides = slides.length > 0;
  const current = hasSlides ? slides[active] : null;

  const title = current?.title ?? fallbackTitle;
  const subtitle = current?.subtitle ?? "TECHNOLOGY • INNOVATION • TRAINING";
  const description = current?.description ?? fallbackDescription;
  const cta1Label = current?.cta1Label ?? "Start a Project";
  const cta1Href = current?.cta1Href ?? "/contact";
  const cta2Label = current?.cta2Label ?? "Explore Services";
  const cta2Href = current?.cta2Href ?? "/services";

  // Entrance animation
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.fromTo(
        root.querySelectorAll(".hero-badge"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      )
        .fromTo(
          root.querySelectorAll(".hero-line"),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" },
          "-=0.3",
        )
        .fromTo(
          root.querySelector(".hero-description"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          "-=0.5",
        )
        .fromTo(
          root.querySelectorAll(".hero-cta"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" },
          "-=0.4",
        )
        .fromTo(
          root.querySelectorAll(".hero-float"),
          { opacity: 0 },
          { opacity: 1, duration: 1, stagger: 0.15, ease: "power2.out" },
          "-=0.3",
        );
    });

    return () => mm.revert();
  }, []);

  // Slide crossfade
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      const el = contentRef.current;
      if (!el) {
        setActive((i) => (i + 1) % slides.length);
        return;
      }
      gsap.to(el, {
        opacity: 0,
        y: -12,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setActive((i) => (i + 1) % slides.length);
          gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
        },
      });
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-navy-900 pt-20"
    >
      <TechBackground type="network" dark className="opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-900/40 to-navy-900" />
      <div className="absolute inset-0 bg-glow-blue opacity-70" aria-hidden />

      {/* Floating technical labels */}
      {FLOATING_LABELS.map((f) => (
        <span
          key={f.label}
          className="hero-float pointer-events-none absolute hidden font-mono text-[10px] uppercase tracking-[0.25em] text-blue-300/50 lg:block"
          style={{ top: f.top, left: f.left, right: f.right }}
        >
          {f.label}
        </span>
      ))}

      <div className="container-tech relative z-10">
        <div ref={contentRef} className="max-w-3xl">
          <div className="hero-badge mb-6 inline-flex items-center gap-2 border border-blue-400/25 bg-blue-500/5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-blue-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            {subtitle}
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title.split("\n").map((line, i) => (
              <span key={i} className="hero-line block overflow-hidden">
                {line}
              </span>
            ))}
          </h1>

          <p className="hero-description mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            {description}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href={cta1Href} variant="primary" size="lg" className="hero-cta group">
              {cta1Label}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button href={cta2Href} variant="outline" size="lg" className="hero-cta">
              {cta2Label}
            </Button>
          </div>
        </div>

        {hasSlides && slides.length > 1 && (
          <div className="mt-16 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1 transition-all duration-300 ${
                  i === active ? "w-8 bg-blue-400" : "w-4 bg-white/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-slate-500 lg:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
