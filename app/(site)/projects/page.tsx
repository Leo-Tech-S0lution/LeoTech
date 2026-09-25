import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { TechBackground } from "@/components/patterns/tech-background";
import { getPublishedProjects } from "@/lib/db/queries/projects";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/projects", {
    title: "Projects",
    description:
      "Selected software, AI, IoT and cloud projects designed, built and shipped by Leo Tech Solution.",
  });
}

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <PageHeader
        eyebrow="PROJECTS"
        title="Selected work"
        description="Systems we've designed, built, and shipped — across logistics, healthcare, agtech, fintech, and public infrastructure."
        pattern="blueprint"
      />

      <section className="py-20 lg:py-28">
        <div className="container-tech">
          {projects.length === 0 ? (
            <EmptyState message="Case studies will appear here once projects are published." />
          ) : (
            <Reveal stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group relative block aspect-4/3 overflow-hidden border border-border bg-navy-900"
                >
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover opacity-80 transition-transform duration-700 ease-technical group-hover:scale-105"
                    />
                  ) : (
                    <TechBackground type="blueprint" dark className="opacity-70" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-navy-900 via-navy-900/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    {project.category && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400">
                        {project.category}
                      </span>
                    )}
                    <h2 className="mt-2 font-display text-xl font-semibold text-white">{project.title}</h2>
                    {project.summary && <p className="mt-2 max-w-md text-sm text-slate-300">{project.summary}</p>}
                  </div>
                  <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-white/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </Link>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      <CtaSection title="Want results like these?" description="Tell us about your project — we'll walk through scope and approach." />
    </>
  );
}
