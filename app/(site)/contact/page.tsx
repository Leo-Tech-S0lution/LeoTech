import { Mail, Phone, MapPin, Clock, Calendar } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { ContactForm } from "@/components/sections/contact-form";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionWrapper } from "@/components/sections/section-wrapper";
import { Reveal } from "@/components/animations/reveal";
import { TechBackground } from "@/components/patterns/tech-background";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { getPublishedServices } from "@/lib/db/queries/services";
import { getPublishedFaqs } from "@/lib/db/queries/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/contact");
}

export default async function ContactPage() {
  const [settings, services, faqs] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
    getPublishedFaqs(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="CONTACT"
        title="Let's talk about your project"
        description="Tell us what you're building — we'll get back to you within one business day."
        pattern="network"
      />

      <section className="relative py-20 lg:py-28">
        <div className="container-tech grid grid-cols-1 gap-16 lg:grid-cols-[1fr_380px]">
          <Reveal>
            <ContactForm serviceOptions={services.map((s) => s.title)} />
          </Reveal>

          <Reveal className="relative h-fit overflow-hidden border border-border bg-navy-900 p-7 text-white">
            <TechBackground type="network" dark className="opacity-40" />
            <div className="relative space-y-6">
              {settings.email && (
                <InfoRow icon={Mail} label="Email" value={settings.email} href={`mailto:${settings.email}`} />
              )}
              {settings.phone && (
                <InfoRow icon={Phone} label="Phone" value={settings.phone} href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} />
              )}
              {settings.address && <InfoRow icon={MapPin} label="Office" value={settings.address} />}
              {settings.businessHours && <InfoRow icon={Clock} label="Hours" value={settings.businessHours} />}
              {settings.schedulingUrl && (
                <a
                  href={settings.schedulingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-300 hover:bg-blue-500/20"
                >
                  <Calendar className="h-4 w-4" /> Schedule a Call
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {faqs.length > 0 && (
        <SectionWrapper index="FAQ" label="Common Questions" title="Frequently Asked Questions" headerAlign="center">
          <div className="mx-auto max-w-2xl">
            <FaqAccordion faqs={faqs} />
          </div>
        </SectionWrapper>
      )}
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}
