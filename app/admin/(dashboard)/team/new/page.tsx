import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { TeamForm } from "../team-form";

export default async function NewTeamMemberPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New Team Member" description="Add a new team member." />
      <TeamForm />
    </div>
  );
}
