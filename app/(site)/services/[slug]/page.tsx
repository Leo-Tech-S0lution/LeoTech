import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { getServiceBySlug, getPublishedServices } from "@/lib/db/queries/services";
import { getSiteSettings } from "@/lib/db/queries/settings";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/seo/site";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await getPublishedServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  const title = service.seoTitle ?? service.title;
  const description = service.seoDescription ?? service.shortDescription ?? undefined;
  const image = service.ogImage ?? undefined;

  return {
    title,
    alternates: { canonical: `/services/${slug}` },
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { title, description },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getServiceBySlug(slug), getSiteSettings()]);

  if (!service) notFound();

  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription ?? undefined,
    provider: { "@type": "Organization", name: settings.companyName, url: siteUrl },
    url: `${siteUrl}/services/${service.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader eyebrow="SERVICE" title={service.title} description={service.shortDescription ?? undefined} pattern="circuit" />

      <section className="py-20 lg:py-28">
        <div className="container-tech grid grid-cols-1 gap-16 lg:grid-cols-[1fr_320px]">
          <Reveal className="space-y-6">
            <DynamicIcon icon={service.icon} className="h-10 w-10 text-blue-500" strokeWidth={1.5} />
            {service.description && (
              <p className="max-w-2xl whitespace-pre-line text-base leading-relaxed text-slate-600">
                {service.description}
              </p>
            )}

            {service.features && service.features.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-navy-900">What&apos;s Included</h2>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>

          <Reveal className="h-fit border border-border bg-slate-50 p-6">
            {service.technologies && service.technologies.length > 0 && (
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Technologies
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {service.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="border border-border bg-white px-2.5 py-1 font-mono text-[11px] text-slate-600"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button href={service.ctaHref || "/contact"} variant="primary" size="md" className="w-full">
                {service.ctaLabel || "Start a Project"}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
