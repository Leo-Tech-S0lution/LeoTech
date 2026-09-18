import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllProjectsAdmin } from "@/lib/db/queries/projects";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { ProjectsTable } from "./projects-table";

export default async function ProjectsPage() {
  await requireAdmin();
  const projects = await getAllProjectsAdmin();

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage the portfolio projects shown on the public site."
        actions={
          <AdminButton href="/admin/projects/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Project
          </AdminButton>
        }
      />
      <ProjectsTable projects={projects} />
    </div>
  );
}
