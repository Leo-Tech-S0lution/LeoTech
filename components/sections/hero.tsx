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
  const hasAnyImage = slides.some((s) => s.image);

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

  // Auto-advance is driven by the ticker's progress bar (see TickerProgress), so
  // the bar and the slide change always stay in sync.
  return (
    <section
      ref={rootRef}
      className="relative flex min-h-svh flex-col overflow-hidden bg-navy-900 pt-20"
    >
      {/* Mobile: image on top, text below (stacked). Desktop: text left, image bleeding off the right edge. */}
      <div className="relative flex flex-1 flex-col lg:flex-row lg:items-center">
        <TechBackground type="network" dark className="opacity-40" />
        <div className="absolute inset-0 bg-glow-blue opacity-70" aria-hidden />
        {hasAnyImage && <HeroImages slides={slides} active={active} />}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-navy-900" />

        <div
          className={cn(
            "container-tech relative z-10 flex flex-1 flex-col justify-center pb-10 lg:py-16",
            hasAnyImage ? "-mt-6 sm:-mt-10 lg:mt-0" : "pt-12",
          )}
        >
          <div ref={contentRef} className="max-w-2xl lg:max-w-[46%]">
            <div className="hero-badge mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-blue-400 sm:mb-5 sm:text-xs sm:tracking-[0.25em]">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-blue-400" />
              <span className="min-w-0">{subtitle}</span>
            </div>

            <h1 className="font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-white wrap-break-word min-[400px]:text-4xl sm:text-5xl sm:leading-[1.08] lg:text-6xl">
              {title.split("\n").map((line, i) => (
                <span key={i} className="hero-line block overflow-hidden">
                  {line}
                </span>
              ))}
            </h1>

            <p className="hero-description mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:mt-6 sm:text-lg">
              {description}
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-10 sm:items-start">
              <Button href={cta1Href} variant="primary" size="lg" className="hero-cta group justify-center">
                {cta1Label}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <a
                href={cta2Href}
                className="hero-cta group inline-flex items-center justify-center gap-1.5 py-1 text-sm font-medium text-slate-300 underline decoration-slate-500 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
              >
                {cta2Label}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {hasSlides && slides.length > 1 && (
        <HeroTicker
          slides={slides}
          active={active}
          onSelect={goToSlide}
          onComplete={() => goToSlide(active + 1)}
        />
      )}
    </section>
  );
}

/**
 * Right-hand image that bleeds to the viewport edge and fades into the
 * background on its left and bottom (NVIDIA-style). On mobile it sits above the
 * text as a full-width banner fading into it. Each slide's image is stacked absolutely; the
 * outgoing one drifts out while the incoming one drifts in, crossfading.
 */
function HeroImages({ slides, active }: { slides: HeroSlide[]; active: number }) {
  const layerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const prevActiveRef = useRef(active);

  useEffect(() => {
    const prev = prevActiveRef.current;
    prevActiveRef.current = active;
    if (prev === active) return;

    const outEl = layerRefs.current[prev];
    const inEl = layerRefs.current[active];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      if (outEl) gsap.set(outEl, { opacity: 0, xPercent: 0 });
      if (inEl) gsap.set(inEl, { opacity: 1, xPercent: 0 });
      return;
    }

    if (outEl) {
      gsap.killTweensOf(outEl);
      gsap.to(outEl, { opacity: 0, xPercent: -3, scale: 1.02, duration: 1.4, ease: "sine.inOut" });
    }
    if (inEl) {
      gsap.killTweensOf(inEl);
      gsap.fromTo(
        inEl,
        { opacity: 0, xPercent: 3, scale: 1.02 },
        { opacity: 1, xPercent: 0, scale: 1, duration: 1.4, ease: "sine.inOut" },
      );
    }
  }, [active]);

  return (
    <div
      className="hero-image-mask pointer-events-none relative aspect-16/10 max-h-[42svh] w-full shrink-0 overflow-hidden opacity-85 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:max-h-none lg:w-[58%] lg:opacity-70"
      aria-hidden
    >
      {slides.map((slide, i) =>
        slide.image ? (
          <div
            key={slide.id}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              priority={i === active}
              className="object-cover"
            />
          </div>
        ) : null,
      )}
    </div>
  );
}

/**
 * NVIDIA-style slide rail: one column per slide, each with its own progress
 * track, a category label and a two-line title. Scrolls sideways on small
 * screens and keeps the active slide in view.
 */
function HeroTicker({
  slides,
  active,
  onSelect,
  onComplete,
}: {
  slides: HeroSlide[];
  active: number;
  onSelect: (index: number) => void;
  onComplete: () => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep the active item visible on the scrollable mobile rail. Scrolls only the
  // rail itself (never the page, which scrollIntoView could do).
  useEffect(() => {
    const rail = railRef.current;
    const item = itemRefs.current[active];
    if (!rail || !item || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({ left: item.offsetLeft - rail.offsetLeft - 20, behavior: "smooth" });
  }, [active]);

  return (
    <div className="hero-ticker relative z-10 pb-6 lg:pb-8">
      <div
        ref={railRef}
        className="container-tech flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto sm:scroll-px-8 scrollbar-none lg:grid lg:gap-8 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}
      >
        {slides.map((slide, i) => {
          const isActive = i === active;
          const fullTitle = slide.title.replace(/\n/g, " ");
          return (
            <button
              key={slide.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onClick={() => onSelect(i)}
              aria-label={`Show slide ${i + 1}: ${fullTitle}`}
              aria-current={isActive ? "true" : undefined}
              // flex-col + justify-start: a <button> centres its content vertically by
              // default, which drops one-line titles below their neighbours.
              className="group flex w-[70%] shrink-0 snap-start flex-col justify-start text-left sm:w-[40%] lg:w-auto"
            >
              <span className="block h-0.75 overflow-hidden bg-white/15">
                <TickerProgress active={isActive} onComplete={onComplete} />
              </span>
              <span
                className={cn(
                  "mt-4 block truncate text-xs font-semibold transition-colors duration-500",
                  isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300",
                )}
              >
                {slide.subtitle || `Slide ${i + 1}`}
              </span>
              <span
                className={cn(
                  "mt-1.5 line-clamp-2 text-sm leading-snug transition-colors duration-500 sm:text-[15px]",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200",
                )}
              >
                {fullTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Fills over SLIDE_DURATION_MS for the active slide, then calls onComplete to
 * advance.
 */
function TickerProgress({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const barRef = useRef<HTMLSpanElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    gsap.killTweensOf(el);

    if (!active) {
      // The finished bar eases out instead of snapping back to empty.
      gsap.to(el, { scaleX: 0, duration: 0.5, ease: "power2.out" });
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const done = () => onCompleteRef.current();
    gsap.set(el, { scaleX: reducedMotion ? 1 : 0 });
    const tween = reducedMotion
      ? gsap.delayedCall(SLIDE_DURATION_MS / 1000, done)
      : gsap.to(el, { scaleX: 1, duration: SLIDE_DURATION_MS / 1000, ease: "none", onComplete: done });

    return () => {
      tween.kill();
    };
  }, [active]);

  return <span ref={barRef} className="block h-full w-full origin-left scale-x-0 bg-blue-400" />;
}
