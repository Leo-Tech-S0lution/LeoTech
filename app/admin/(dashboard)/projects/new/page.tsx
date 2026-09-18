import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New Project" description="Create a new portfolio project entry." />
      <ProjectForm />
    </div>
  );
}
