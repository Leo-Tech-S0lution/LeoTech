import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { TechBackground } from "@/components/patterns/tech-background";
import type { Project } from "@/lib/db/schema";

interface ProjectsShowcaseProps {
  title: string;
  description: string | null;
  projects: Project[];
}

export function ProjectsShowcase({ title, description, projects }: ProjectsShowcaseProps) {
  if (projects.length === 0) {
    return (
      <SectionWrapper index="04" label="Selected Work" title={title} description={description}>
        <EmptyState message="Case studies will appear here once projects are published." />
      </SectionWrapper>
    );
  }

  const featured = projects[0]!;
  const rest = projects.slice(1);

  return (
    <SectionWrapper index="04" label="Selected Work" title={title} description={description}>
      <Reveal>
        <ProjectCard project={featured} large />
      </Reveal>

      {rest.length > 0 && (
        <Reveal stagger className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </Reveal>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700"
        >
          View All Projects
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </SectionWrapper>
  );
}

function ProjectCard({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group relative block overflow-hidden border border-border bg-navy-900 ${
        large ? "aspect-16/8" : "aspect-4/3"
      }`}
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
        <h3 className={`mt-2 font-display font-semibold text-white ${large ? "text-2xl" : "text-lg"}`}>
          {project.title}
        </h3>
        {large && project.summary && (
          <p className="mt-2 max-w-lg text-sm text-slate-300">{project.summary}</p>
        )}
      </div>
      <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-white/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
    </Link>
  );
}
