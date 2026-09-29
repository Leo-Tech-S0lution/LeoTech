import Link from "next/link";
import { MapPin, Briefcase, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { getOpenJobs } from "@/lib/db/queries/careers";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/careers", {
    title: "Careers",
    description:
      "Open positions at Leo Tech Solution — join our engineering, AI/ML and training teams.",
  });
}

export default async function CareersPage() {
  const jobs = await getOpenJobs();

  return (
    <>
      <PageHeader
        eyebrow="CAREERS"
        title="Build and teach with us"
        description="We hire engineers who can both ship production work and explain how they did it."
        pattern="grid"
      />

      <section className="py-20 lg:py-28">
        <div className="container-tech">
          {jobs.length === 0 ? (
            <EmptyState message="There are no open positions right now — check back soon." />
          ) : (
            <Reveal stagger className="divide-y divide-border border-y border-border">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/careers/${job.slug}`}
                  className="group flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center"
                >
                  <div>
                    <h2 className="font-display text-lg font-semibold text-heading group-hover:text-blue-600">
                      {job.title}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      {job.department && (
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" /> {job.department}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {job.location}
                        </span>
                      )}
                      <span className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide">
                        {job.employmentType}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500" />
                </Link>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      <CtaSection title="Don't see the right role?" description="Send us your resume anyway — we're always interested in strong engineers and instructors." />
    </>
  );
}
