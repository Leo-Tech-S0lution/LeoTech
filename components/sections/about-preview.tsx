import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { AnimatedCounter } from "@/components/animations/animated-counter";
import { TechBackground } from "@/components/patterns/tech-background";
import { Reveal } from "@/components/animations/reveal";
import type { Statistic } from "@/lib/db/schema";

interface AboutPreviewProps {
  title: string;
  description: string | null;
  statistics: Statistic[];
}

export function AboutPreview({ title, description, statistics }: AboutPreviewProps) {
  return (
    <SectionWrapper
      index="01"
      label="About LeoTech"
      title={title}
      description={description}
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="space-y-6 text-base leading-relaxed text-slate-600">
          <p>
            Leo Tech Solution is a technology company built around a simple idea: software,
            infrastructure, and the people who run them should be engineered with the same
            rigor. We design and build custom applications, AI/ML systems, IoT platforms, and
            cloud infrastructure — and we run a hands-on training academy that prepares the next
            generation of engineers to build them.
          </p>
          <p>
            Every engagement starts with understanding the problem, not the technology. From
            there we design systems that are maintainable, secure, and built to scale with the
            business behind them.
          </p>
          <Link
            href="/about"
            className="group inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
          >
            More about LeoTech
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal className="relative aspect-[4/3] overflow-hidden border border-border bg-navy-900">
          <TechBackground type="ai" dark className="opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />
        </Reveal>
      </div>

      {statistics.length > 0 && (
        <Reveal stagger className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-10 sm:grid-cols-4">
          {statistics.map((stat) => (
            <div key={stat.id}>
              <div className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ""} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </Reveal>
      )}
    </SectionWrapper>
  );
}
