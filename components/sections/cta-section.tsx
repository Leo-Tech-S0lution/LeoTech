import { ArrowRight } from "lucide-react";
import { TechBackground } from "@/components/patterns/tech-background";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { Reveal } from "@/components/animations/reveal";

interface CtaSectionProps {
  title?: string;
  description?: string;
}

export function CtaSection({
  title = "Have a project in mind?",
  description = "Tell us what you're building. We'll get back to you within one business day with next steps.",
}: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-24 text-center lg:py-32">
      <TechBackground type="network" dark className="opacity-50" />
      <div className="absolute inset-0 bg-glow-blue" />
      <div className="container-tech relative">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-5 text-base text-slate-400 sm:text-lg">{description}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton>
              <Button href="/contact" variant="primary" size="lg" className="group">
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </MagneticButton>
            <Button href="/projects" variant="outline" size="lg">
              See Our Work
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
