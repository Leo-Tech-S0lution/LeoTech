import { TechBackground, type TechBackgroundType } from "@/components/patterns/tech-background";
import { Reveal } from "@/components/animations/reveal";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  pattern?: TechBackgroundType;
}

/** Compact dark navy header used at the top of interior pages (not the homepage hero). */
export function PageHeader({ eyebrow, title, description, pattern = "grid" }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-navy-900 pb-16 pt-36 lg:pb-20 lg:pt-44">
      <TechBackground type={pattern} dark className="opacity-50" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-navy-900" />
      <div className="container-tech relative">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
            {eyebrow}
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
