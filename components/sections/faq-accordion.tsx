"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Faq } from "@/lib/db/schema";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-y divide-border border-y border-border">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-medium text-heading">{faq.question}</span>
              <Plus className={cn("h-4 w-4 shrink-0 text-blue-500 transition-transform duration-300", isOpen && "rotate-45")} />
            </button>
            <div
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-technical",
                isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]",
              )}
            >
              <p className="overflow-hidden text-sm leading-relaxed text-slate-500">{faq.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
