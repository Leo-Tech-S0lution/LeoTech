import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { CourseForm } from "../course-form";

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New Course" description="Create a new training course." />
      <CourseForm />
    </div>
  );
}
