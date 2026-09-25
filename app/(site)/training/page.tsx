import Link from "next/link";
import { ArrowUpRight, Clock, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublishedCourses } from "@/lib/db/queries/training";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return buildPageMetadata("/training", {
    title: "Technology Training",
    description:
      "Hands-on technology training from Leo Tech Solution — coding, AI/ML, IoT, robotics, cloud and more, taught by working engineers.",
  });
}

export default async function TrainingPage() {
  const courses = await getPublishedCourses();

  return (
    <>
      <PageHeader
        eyebrow="TRAINING ACADEMY"
        title="Hands-on technology training"
        description="Courses built around the same tools and workflows we use on client projects — not a generic curriculum."
        pattern="grid"
      />

      <section className="py-20 lg:py-28">
        <div className="container-tech">
          {courses.length === 0 ? (
            <EmptyState message="Courses will appear here once they're published from the admin dashboard." />
          ) : (
            <Reveal stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/training/${course.slug}`}
                  className="group flex flex-col border border-border bg-white p-6 transition-colors hover:border-blue-400/40 hover:bg-slate-50"
                >
                  {course.category && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-600">
                      {course.category}
                    </span>
                  )}
                  <h2 className="mt-3 font-display text-lg font-semibold text-navy-900">{course.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{course.description}</p>
                  <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-slate-500">
                    {course.duration && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {course.duration}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 capitalize">
                      <BarChart3 className="h-3.5 w-3.5" /> {course.level}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    View Course <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </Reveal>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700"
            >
              Explore Internship Programs <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <CtaSection title="Have questions about a course?" description="Reach out and we'll help you find the right program." />
    </>
  );
}
