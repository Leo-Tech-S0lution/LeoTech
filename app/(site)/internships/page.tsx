import { FileText, Users, GraduationCap, Rocket, ClipboardCheck, Award } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublishedInternshipPrograms } from "@/lib/db/queries/training";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/internships", {
    title: "Internships",
    description:
      "Mentored internship programs at Leo Tech Solution where participants join real project teams building production software.",
  });
}

const TIMELINE = [
  { icon: FileText, label: "Apply", description: "Submit your application and portfolio for review." },
  { icon: Users, label: "Selection", description: "A short interview to confirm fit and readiness." },
  { icon: GraduationCap, label: "Training", description: "Onboarding into our tools, codebase, and process." },
  { icon: Rocket, label: "Project", description: "Work on a real project alongside a senior mentor." },
  { icon: ClipboardCheck, label: "Evaluation", description: "Structured feedback on your work and growth." },
  { icon: Award, label: "Certificate", description: "Receive a Leo Tech Solution certificate of completion." },
];

export default async function InternshipsPage() {
  const programs = await getPublishedInternshipPrograms();

  return (
    <>
      <PageHeader
        eyebrow="INTERNSHIPS"
        title="Internship programs"
        description="Work on real project teams under senior mentorship — not disposable class exercises."
        pattern="network"
      />

      <section className="py-20 lg:py-28">
        <div className="container-tech">
          {programs.length === 0 ? (
            <EmptyState message="Internship programs will appear here once they're published from the admin dashboard." />
          ) : (
            <Reveal stagger className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {programs.map((program) => (
                <div key={program.id} className="border border-border bg-white p-7">
                  <h2 className="font-display text-xl font-semibold text-heading">{program.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{program.description}</p>
                  <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                    {program.duration && (
                      <div className="flex gap-2">
                        <dt className="font-medium text-heading">Duration:</dt>
                        <dd className="text-slate-500">{program.duration}</dd>
                      </div>
                    )}
                    {program.eligibility && (
                      <div className="flex gap-2">
                        <dt className="font-medium text-heading">Eligibility:</dt>
                        <dd className="text-slate-500">{program.eligibility}</dd>
                      </div>
                    )}
                    {program.mentorship && (
                      <div className="flex gap-2">
                        <dt className="font-medium text-heading">Mentorship:</dt>
                        <dd className="text-slate-500">{program.mentorship}</dd>
                      </div>
                    )}
                    {program.certificate && (
                      <div className="flex gap-2">
                        <dt className="font-medium text-heading">Certificate:</dt>
                        <dd className="text-slate-500">{program.certificate}</dd>
                      </div>
                    )}
                  </dl>
                  {program.technologies && program.technologies.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {program.technologies.map((tech) => (
                        <span key={tech} className="border border-border px-2.5 py-1 font-mono text-[11px] text-slate-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      <section className="bg-navy-900 py-20 lg:py-24">
        <div className="container-tech">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">Application Process</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-white">From Application to Certificate</h2>
          </Reveal>

          <Reveal stagger className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {TIMELINE.map((step, i) => (
              <div key={step.label} className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center border border-blue-400/30 bg-blue-500/10">
                  <step.icon className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
                </div>
                <span className="mt-3 block font-mono text-[10px] text-blue-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-1 font-display text-sm font-semibold text-white">{step.label}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{step.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaSection title="Ready to apply?" description="Reach out with your resume and area of interest — we review applications on a rolling basis." />
    </>
  );
}
