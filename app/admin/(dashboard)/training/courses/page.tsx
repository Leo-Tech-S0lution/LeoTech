import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllCoursesAdmin } from "@/lib/db/queries/training";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { CoursesTable } from "./courses-table";

export default async function CoursesPage() {
  await requireAdmin();
  const courses = await getAllCoursesAdmin();

  return (
    <div>
      <PageHeader
        title="Training Courses"
        description="Manage the courses shown in the training academy."
        actions={
          <AdminButton href="/admin/training/courses/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Course
          </AdminButton>
        }
      />
      <CoursesTable courses={courses} />
    </div>
  );
}
