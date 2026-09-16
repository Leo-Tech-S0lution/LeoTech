"use client";

import { useEffect, useRef, useState } from "react";
import { SectionWrapper } from "./section-wrapper";
import { getIcon } from "@/lib/icons";
import { gsap, ScrollTrigger } from "@/components/animations/gsap-setup";
import type { ProcessStep } from "@/lib/db/schema";

interface ProcessProps {
  title: string;
  description: string | null;
  steps: ProcessStep[];
}

export function Process({ title, description, steps }: ProcessProps) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const line = lineRef.current;
    if (!list || !line || steps.length === 0) return;

    const items = Array.from(list.querySelectorAll<HTMLDivElement>("[data-step]"));
    const triggers = items.map((item, i) =>
      ScrollTrigger.create({
        trigger: item,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),
      }),
    );

    const lineTrigger = ScrollTrigger.create({
      trigger: list,
      start: "top center",
      end: "bottom center",
      scrub: 0.5,
      onUpdate: (self) => {
        gsap.set(line, { scaleY: self.progress });
      },
    });

    return () => {
      triggers.forEach((t) => t.kill());
      lineTrigger.kill();
    };
  }, [steps.length]);

  if (steps.length === 0) return null;

  return (
    <SectionWrapper index="07" label="Our Process" title={title} description={description}>
      <div ref={listRef} className="relative mx-auto max-w-2xl">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border">
          <div
            ref={lineRef}
            className="h-full w-full origin-top scale-y-0 bg-blue-500"
          />
        </div>

        <div className="space-y-10">
          {steps.map((step, i) => {
            const Icon = getIcon(step.icon);
            const isActive = i === active;
            return (
              <div key={step.id} data-step className="relative flex gap-6 pl-0">
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center border transition-colors duration-300 ${
                    isActive
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-border bg-white text-slate-400"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <span className="font-mono text-xs text-blue-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className={`mt-1 font-display text-lg font-semibold transition-colors duration-300 ${
                      isActive ? "text-navy-900" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
