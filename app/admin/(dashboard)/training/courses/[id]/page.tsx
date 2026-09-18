import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getCourseByIdAdmin } from "@/lib/db/queries/training";
import { PageHeader } from "@/components/admin/page-header";
import { CourseForm } from "../course-form";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const course = await getCourseByIdAdmin(id);
  if (!course) notFound();

  return (
    <div>
      <PageHeader title="Edit Course" description={course.title} />
      <CourseForm course={course} />
    </div>
  );
}
