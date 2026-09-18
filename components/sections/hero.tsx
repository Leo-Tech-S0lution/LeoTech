"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap } from "@/components/animations/gsap-setup";
import { TechBackground } from "@/components/patterns/tech-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { HeroSlide } from "@/lib/db/schema";

const SLIDE_DURATION_MS = 7000;

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
  const image = current?.image;

  function goToSlide(index: number) {
    const el = contentRef.current;
    const next = ((index % slides.length) + slides.length) % slides.length;
    if (!el) {
      setActive(next);
      return;
    }
    gsap.to(el, {
      opacity: 0,
      y: -12,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        setActive(next);
        gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      },
    });
  }

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
          root.querySelectorAll(".hero-ticker"),
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          "-=0.3",
        );
    });

    return () => mm.revert();
  }, []);

  // Auto-advance — restarts on every slide change, manual or automatic.
  useEffect(() => {
    if (slides.length <= 1) return;
    const timeout = setTimeout(() => goToSlide(active + 1), SLIDE_DURATION_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, slides.length]);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[92vh] flex-col overflow-hidden bg-navy-900 pt-20"
    >
      <div className="relative flex flex-1 items-center">
        {image ? (
          <>
            <Image
              src={image}
              alt=""
              fill
              priority
              className="object-cover object-[75%_center] opacity-90"
            />
            <TechBackground type="network" dark className="opacity-25" />
          </>
        ) : (
          <TechBackground type="network" dark className="opacity-60" />
        )}
        {/* Left-to-right fade so text stays legible over an image or the pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-navy-900/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-900" />
        {!image && <div className="absolute inset-0 bg-glow-blue opacity-70" aria-hidden />}

        <div className="container-tech relative z-10">
          <div ref={contentRef} className="max-w-2xl">
            <div className="hero-badge mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-blue-400" />
              {subtitle}
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title.split("\n").map((line, i) => (
                <span key={i} className="hero-line block overflow-hidden">
                  {line}
                </span>
              ))}
            </h1>

            <p className="hero-description mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {description}
            </p>

            <div className="mt-10 flex flex-col items-start gap-4">
              <Button href={cta1Href} variant="primary" size="lg" className="hero-cta group">
                {cta1Label}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <a
                href={cta2Href}
                className="hero-cta group inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 underline decoration-slate-500 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                {cta2Label}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            {hasSlides && slides.length > 1 && (
              <div className="mt-12 flex items-center gap-2 lg:hidden">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goToSlide(i)}
                    className={cn(
                      "h-1 transition-all duration-300",
                      i === active ? "w-8 bg-blue-400" : "w-4 bg-white/20",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasSlides && slides.length > 1 && (
        <HeroTicker slides={slides} active={active} onSelect={goToSlide} />
      )}
    </section>
  );
}

function HeroTicker({
  slides,
  active,
  onSelect,
}: {
  slides: HeroSlide[];
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="hero-ticker relative z-10 hidden border-t border-white/10 bg-navy-900/60 backdrop-blur-sm lg:block">
      <div className="container-tech grid" style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}>
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => onSelect(i)}
            className={cn(
              "group relative border-l border-white/10 px-5 py-5 text-left first:border-l-0",
            )}
          >
            <span className="absolute inset-x-0 top-0 h-px bg-white/10">
              <TickerProgress active={i === active} />
            </span>
            <span
              className={cn(
                "block font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                i === active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400",
              )}
            >
              {slide.subtitle || `Slide ${i + 1}`}
            </span>
            <span
              className={cn(
                "mt-1.5 block line-clamp-1 text-sm font-medium transition-colors",
                i === active ? "text-white" : "text-slate-500 group-hover:text-slate-300",
              )}
            >
              {slide.title.split("\n")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TickerProgress({ active }: { active: boolean }) {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    gsap.killTweensOf(el);

    if (!active) {
      gsap.set(el, { scaleX: 0 });
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { scaleX: 1 });
      return;
    }
    gsap.set(el, { scaleX: 0 });
    gsap.to(el, { scaleX: 1, duration: SLIDE_DURATION_MS / 1000, ease: "none" });
  }, [active]);

  return <span ref={barRef} className="block h-full w-full origin-left bg-blue-400" />;
}
