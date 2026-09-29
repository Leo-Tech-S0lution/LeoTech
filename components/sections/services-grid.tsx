import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { getIcon } from "@/lib/icons";
import type { Service } from "@/lib/db/schema";

interface ServicesGridProps {
  title: string;
  description: string | null;
  services: Service[];
}

export function ServicesGrid({ title, description, services }: ServicesGridProps) {
  if (services.length === 0) {
    return (
      <SectionWrapper index="02" label="Services" title={title} description={description}>
        <EmptyState message="Services will appear here once they're published from the admin dashboard." />
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper index="02" label="Services" title={title} description={description}>
      <Reveal stagger className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = getIcon(service.icon);
          return (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group relative flex flex-col justify-between bg-white p-7 transition-colors hover:bg-slate-50 min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Icon className="h-7 w-7 text-blue-500" strokeWidth={1.5} />
                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-heading">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {service.shortDescription}
                </p>
              </div>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          );
        })}
      </Reveal>

      <div className="mt-10 text-center">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700"
        >
          View All Services
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
