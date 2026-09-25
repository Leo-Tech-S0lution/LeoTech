import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { TechBackground, type TechBackgroundType } from "@/components/patterns/tech-background";
import { getIcon } from "@/lib/icons";
import { getPublishedServices } from "@/lib/db/queries/services";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/solutions", {
    title: "Solutions",
    description:
      "AI & machine learning, IoT & robotics, cloud, cybersecurity, networking and UI/UX solutions delivered by Leo Tech Solution.",
  });
}

const DOMAINS: {
  id: string;
  label: string;
  title: string;
  description: string;
  pattern: TechBackgroundType;
  serviceSlug: string;
}[] = [
  {
    id: "ai-ml",
    label: "AI / ML",
    title: "AI & Machine Learning",
    description:
      "Practical machine learning systems — model development, computer vision, NLP, and the production infrastructure to run them reliably.",
    pattern: "ai",
    serviceSlug: "ai-machine-learning",
  },
  {
    id: "iot",
    label: "IoT & Robotics",
    title: "IoT & Robotics",
    description:
      "Connected device systems from sensors and firmware through cloud ingestion, dashboards, and automated control logic.",
    pattern: "iot",
    serviceSlug: "iot-solutions",
  },
  {
    id: "cloud",
    label: "Cloud",
    title: "Cloud Solutions",
    description:
      "Cloud architecture that scales predictably — infrastructure as code, CI/CD, and cost-aware infrastructure design.",
    pattern: "cloud",
    serviceSlug: "cloud-solutions",
  },
  {
    id: "security",
    label: "Cybersecurity",
    title: "Cybersecurity",
    description:
      "Security architecture review, hardening, and ongoing monitoring for applications and infrastructure.",
    pattern: "security",
    serviceSlug: "cybersecurity",
  },
  {
    id: "networking",
    label: "Networking",
    title: "Networking Solutions",
    description:
      "Network architecture, secure remote access, and monitoring built for distributed and growing teams.",
    pattern: "circuit",
    serviceSlug: "networking-solutions",
  },
  {
    id: "uiux",
    label: "UI/UX",
    title: "UI/UX Design",
    description:
      "Interface design grounded in usability research — wireframing, prototyping, and design systems.",
    pattern: "grid",
    serviceSlug: "ui-ux-design",
  },
];

export default async function SolutionsPage() {
  const services = await getPublishedServices();
  const byService = (slug: string) => services.find((s) => s.slug === slug);

  return (
    <>
      <PageHeader
        eyebrow="SOLUTIONS"
        title="Solutions by domain"
        description="The technology areas we work in most — each backed by a dedicated service offering."
        pattern="grid"
      />

      {DOMAINS.map((domain, i) => {
        const service = byService(domain.serviceSlug);
        const Icon = getIcon(service?.icon ?? domain.id);
        const dark = i % 2 === 0;

        return (
          <section
            key={domain.id}
            id={domain.id}
            className={`relative scroll-mt-24 overflow-hidden py-20 lg:py-24 ${dark ? "bg-navy-900" : "bg-white"}`}
          >
            <TechBackground type={domain.pattern} dark={dark} className={dark ? "opacity-50" : "opacity-100"} />
            <div className="container-tech relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <Reveal className={i % 2 === 1 ? "lg:order-2" : undefined}>
                <span className={`font-mono text-xs uppercase tracking-[0.25em] ${dark ? "text-blue-400" : "text-blue-600"}`}>
                  {domain.label}
                </span>
                <h2 className={`mt-3 font-display text-3xl font-bold sm:text-4xl ${dark ? "text-white" : "text-navy-900"}`}>
                  {domain.title}
                </h2>
                <p className={`mt-4 max-w-lg text-base leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  {service?.description ?? domain.description}
                </p>
                {service && (
                  <Link
                    href={`/services/${service.slug}`}
                    className={`mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] ${
                      dark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    View Service <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </Reveal>
              <Reveal
                className={`relative flex aspect-square max-w-sm items-center justify-center justify-self-center border ${
                  dark ? "border-white/10" : "border-border"
                } ${i % 2 === 1 ? "lg:order-1" : ""}`}
              >
                <Icon className={`h-16 w-16 ${dark ? "text-blue-400" : "text-blue-500"}`} strokeWidth={1} />
              </Reveal>
            </div>
          </section>
        );
      })}

      <CtaSection />
    </>
  );
}
