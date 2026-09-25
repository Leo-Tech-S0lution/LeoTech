import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { getProjectBySlug, getPublishedProjects } from "@/lib/db/queries/projects";
import type { Metadata } from "next";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const title = project.seoTitle ?? project.title;
  const description = project.seoDescription ?? project.summary ?? undefined;
  const image = project.ogImage ?? project.coverImage ?? undefined;

  return {
    title,
    alternates: { canonical: `/projects/${slug}` },
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { title, description },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        eyebrow={project.category ?? "PROJECT"}
        title={project.title}
        description={project.summary ?? undefined}
        pattern="blueprint"
      />

      {project.coverImage && (
        <div className="container-tech -mt-10 relative z-10">
          <Reveal className="relative aspect-16/8 overflow-hidden border border-border">
            <Image src={project.coverImage} alt={project.title} fill className="object-cover" priority />
          </Reveal>
        </div>
      )}

      <section className="py-20 lg:py-28">
        <div className="container-tech grid grid-cols-1 gap-16 lg:grid-cols-[1fr_320px]">
          <Reveal className="space-y-10">
            {project.challenge && (
              <div>
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  The Challenge
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{project.challenge}</p>
              </div>
            )}
            {project.solution && (
              <div>
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  The Solution
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{project.solution}</p>
              </div>
            )}
            {project.results && (
              <div>
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  The Results
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{project.results}</p>
              </div>
            )}

            {project.gallery && project.gallery.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {project.gallery.map((img) => (
                  <div key={img} className="relative aspect-video overflow-hidden border border-border">
                    <Image src={img} alt={project.title} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal className="h-fit space-y-6 border border-border bg-slate-50 p-6">
            {project.client && (
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Client</h3>
                <p className="mt-1 text-sm text-navy-900">{project.client}</p>
              </div>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Technologies
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="border border-border bg-white px-2.5 py-1 font-mono text-[11px] text-slate-600">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Visit Live Project <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </Reveal>
        </div>

        <div className="container-tech mt-16 border-t border-border pt-8">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-navy-900">
            <ArrowUpRight className="h-4 w-4 rotate-225" /> Back to all projects
          </Link>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
