import { notFound } from "next/navigation";
import { Check, Clock, BarChart3, Award, Calendar, User } from "lucide-react";
import { PageHeader } from "@/components/sections/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/animations/reveal";
import { Button } from "@/components/ui/button";
import { getCourseBySlug, getPublishedCourses } from "@/lib/db/queries/training";
import { formatDate } from "@/lib/utils/text";
import type { Metadata } from "next";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const courses = await getPublishedCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};

  const title = course.seoTitle ?? course.title;
  const description = course.seoDescription ?? course.description ?? undefined;
  const image = course.ogImage ?? course.image ?? undefined;

  return {
    title,
    alternates: { canonical: `/training/${slug}` },
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { title, description },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const priceLabel = course.price ? `$${Number(course.price).toLocaleString()}` : "Contact for pricing";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description ?? undefined,
    provider: { "@type": "Organization", name: "Leo Tech Solution" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader eyebrow={course.category ?? "COURSE"} title={course.title} description={course.description ?? undefined} pattern="grid" />

      <section className="py-20 lg:py-28">
        <div className="container-tech grid grid-cols-1 gap-16 lg:grid-cols-[1fr_320px]">
          <Reveal className="space-y-10">
            {course.curriculum && course.curriculum.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-heading">Curriculum</h2>
                <div className="mt-5 space-y-6">
                  {course.curriculum.map((module, i) => (
                    <div key={module.title} className="border-l-2 border-blue-500/30 pl-5">
                      <h3 className="font-medium text-heading">
                        <span className="font-mono text-xs text-blue-500">{String(i + 1).padStart(2, "0")}</span>{" "}
                        {module.title}
                      </h3>
                      <ul className="mt-2 space-y-1.5">
                        {module.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-slate-500">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {course.projects && course.projects.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-heading">Projects You&apos;ll Build</h2>
                <ul className="mt-4 space-y-2">
                  {course.projects.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.certification && (
              <div className="flex items-start gap-3 border border-border bg-slate-50 p-5">
                <Award className="h-5 w-5 shrink-0 text-blue-500" />
                <p className="text-sm text-slate-600">{course.certification}</p>
              </div>
            )}
          </Reveal>

          <Reveal className="h-fit space-y-5 border border-border bg-slate-50 p-6">
            <div className="text-2xl font-bold text-heading">{priceLabel}</div>

            <ul className="space-y-3 border-t border-border pt-4 text-sm text-slate-600">
              {course.duration && (
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-blue-500" /> {course.duration}
                </li>
              )}
              <li className="flex items-center gap-2.5 capitalize">
                <BarChart3 className="h-4 w-4 text-blue-500" /> {course.level}
              </li>
              {course.instructor && (
                <li className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-blue-500" /> {course.instructor}
                </li>
              )}
              {course.startDate && (
                <li className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-blue-500" /> Starts {formatDate(course.startDate)}
                </li>
              )}
            </ul>

            {course.technologies && course.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-border pt-4">
                {course.technologies.map((tech) => (
                  <span key={tech} className="border border-border bg-white px-2.5 py-1 font-mono text-[11px] text-slate-600">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <Button href="/contact" variant="primary" size="md" className="w-full">
              Enroll Now
            </Button>
          </Reveal>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
