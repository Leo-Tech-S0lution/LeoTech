import Link from "next/link";
import { ArrowUpRight, Clock, BarChart3 } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import type { TrainingCourse } from "@/lib/db/schema";

interface TrainingPreviewProps {
  title: string;
  description: string | null;
  courses: TrainingCourse[];
}

export function TrainingPreview({ title, description, courses }: TrainingPreviewProps) {
  return (
    <SectionWrapper index="05" label="Training Academy" title={title} description={description} dark>
      {courses.length === 0 ? (
        <EmptyState
          message="Courses will appear here once they're published from the admin dashboard."
          className="border-white/15 text-slate-500"
        />
      ) : (
        <Reveal stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/training/${course.slug}`}
              className="group flex flex-col border border-white/10 bg-white/2 p-6 transition-colors hover:border-blue-400/30 hover:bg-white/4"
            >
              {course.category && (
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400">
                  {course.category}
                </span>
              )}
              <h3 className="mt-3 font-display text-lg font-semibold text-white">{course.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">{course.description}</p>
              <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4 text-xs text-slate-500">
                {course.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {course.duration}
                  </span>
                )}
                <span className="flex items-center gap-1.5 capitalize">
                  <BarChart3 className="h-3.5 w-3.5" /> {course.level}
                </span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 group-hover:text-blue-300">
                View Course <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </Reveal>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        <Link
          href="/training"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300"
        >
          View All Courses <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/internships"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-white"
        >
          Internship Programs <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
