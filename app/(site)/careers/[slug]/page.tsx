import { notFound } from "next/navigation";
import { Check, MapPin, Briefcase, Calendar } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { Reveal } from "@/components/animations/reveal";
import { formatDate } from "@/lib/utils/text";
import { getJobBySlug, getOpenJobs } from "@/lib/db/queries/careers";
import type { Metadata } from "next";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const jobs = await getOpenJobs();
  return jobs.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  return {
    title: job.title,
    description: job.description ?? undefined,
    alternates: { canonical: `/careers/${slug}` },
  };
}

export default async function JobDetailPage({ params }: JobPageProps) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  return (
    <>
      <PageHeader eyebrow={job.department ?? "CAREERS"} title={job.title} description={job.description ?? undefined} pattern="grid" />

      <section className="py-20 lg:py-28">
        <div className="container-tech grid grid-cols-1 gap-16 lg:grid-cols-[1fr_300px]">
          <Reveal className="space-y-10">
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-heading">Responsibilities</h2>
                <ul className="mt-4 space-y-2.5">
                  {job.responsibilities.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-heading">Requirements</h2>
                <ul className="mt-4 space-y-2.5">
                  {job.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-heading">Benefits</h2>
                <ul className="mt-4 space-y-2.5">
                  {job.benefits.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>

          <Reveal className="h-fit space-y-5 border border-border bg-slate-50 p-6">
            <ul className="space-y-3 text-sm text-slate-600">
              {job.department && (
                <li className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-blue-500" /> {job.department}
                </li>
              )}
              {job.location && (
                <li className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-blue-500" /> {job.location}
                </li>
              )}
              {job.deadline && (
                <li className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-blue-500" /> Apply by {formatDate(job.deadline)}
                </li>
              )}
            </ul>
            {job.applicationInstructions && (
              <div className="border-t border-border pt-4 text-sm leading-relaxed text-slate-600">
                {job.applicationInstructions}
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
