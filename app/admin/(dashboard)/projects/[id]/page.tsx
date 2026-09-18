import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getProjectByIdAdmin } from "@/lib/db/queries/projects";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "../project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const project = await getProjectByIdAdmin(id);
  if (!project) notFound();

  return (
    <div>
      <PageHeader title="Edit Project" description={project.title} />
      <ProjectForm project={project} />
    </div>
  );
}
