"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { gsap } from "@/components/animations/gsap-setup";
import type { Testimonial } from "@/lib/db/schema";

interface TestimonialsCarouselProps {
  title: string;
  description: string | null;
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({ title, description, testimonials }: TestimonialsCarouselProps) {
  const [index, setIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  function go(next: number) {
    const dir = next > index || (index === testimonials.length - 1 && next === 0) ? 1 : -1;
    const el = cardRef.current;
    if (!el) {
      setIndex(((next % testimonials.length) + testimonials.length) % testimonials.length);
      return;
    }
    gsap.to(el, {
      opacity: 0,
      x: -20 * dir,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setIndex(((next % testimonials.length) + testimonials.length) % testimonials.length);
        gsap.fromTo(el, { opacity: 0, x: 20 * dir }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" });
      },
    });
  }

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const t = setInterval(() => go(index + 1), 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, testimonials.length]);

  // Early return only after all hooks have run (rules of hooks).
  if (testimonials.length === 0) return null;
  const current = testimonials[index]!;

  return (
    <SectionWrapper
      index="08"
      label="Client Voices"
      title={title}
      description={description}
      headerAlign="center"
    >
      <div className="mx-auto max-w-3xl">
        <div ref={cardRef} className="relative border border-border bg-white p-8 shadow-card sm:p-12">
          <Quote className="h-8 w-8 text-blue-500/30" />
          <p className="mt-6 text-lg leading-relaxed text-heading sm:text-xl">
            &ldquo;{current.content}&rdquo;
          </p>

          <div className="mt-8 flex items-center gap-4">
            {current.image ? (
              <Image
                src={current.image}
                alt={current.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 font-display text-sm font-semibold text-blue-600">
                {current.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium text-heading">{current.name}</p>
              <p className="text-sm text-slate-500">
                {[current.position, current.company].filter(Boolean).join(" · ")}
              </p>
            </div>
            {current.rating && (
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
                ))}
              </div>
            )}
          </div>
        </div>

        {testimonials.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              aria-label="Previous testimonial"
              onClick={() => go(index - 1)}
              className="flex h-9 w-9 items-center justify-center border border-border text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-1.5 transition-all ${i === index ? "w-6 bg-blue-500" : "w-1.5 bg-border"}`}
                />
              ))}
            </div>
            <button
              aria-label="Next testimonial"
              onClick={() => go(index + 1)}
              className="flex h-9 w-9 items-center justify-center border border-border text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
