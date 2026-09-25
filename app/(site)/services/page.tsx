import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublishedServices } from "@/lib/db/queries/services";
import { getIcon } from "@/lib/icons";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/services", {
    title: "Services",
    description:
      "Software development, AI/ML, IoT, cloud, cybersecurity and networking services from LeoTech Solution — from first architecture sketch to long-term support.",
  });
}

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <>
      <PageHeader
        eyebrow="SERVICES"
        title="End-to-end technology services"
        description="From first architecture sketch to long-term support — software, AI/ML, IoT, cloud, cybersecurity, networking, and design, under one team."
        pattern="circuit"
      />

      <section className="py-20 lg:py-28">
        <div className="container-tech">
          {services.length === 0 ? (
            <EmptyState message="Services will appear here once they're published from the admin dashboard." />
          ) : (
            <Reveal
              stagger
              className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
            >
              {services.map((service) => {
                const Icon = getIcon(service.icon);
                return (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="group relative flex min-h-[240px] flex-col justify-between bg-white p-7 transition-colors hover:bg-slate-50"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Icon className="h-7 w-7 text-blue-500" strokeWidth={1.5} />
                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500" />
                      </div>
                      <h2 className="mt-5 font-display text-lg font-semibold text-navy-900">{service.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">{service.shortDescription}</p>
                      {service.technologies && service.technologies.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {service.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-slate-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />
                  </Link>
                );
              })}
            </Reveal>
          )}
        </div>
      </section>

      <CtaSection
        title="Not sure which service fits?"
        description="Tell us what you're trying to build — we'll help you figure out the right scope."
      />
    </>
  );
}
