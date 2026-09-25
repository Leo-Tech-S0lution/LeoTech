import { requireAdmin } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/admin/page-header";
import { TeamForm } from "../team-form";

export default async function NewTeamMemberPage() {
  const user = await requireAdmin();

  return (
    <div>
      <PageHeader
        title="New Team Member"
        description="Add a team member. Their public profile URL and ID-card QR are created automatically."
      />
      <TeamForm canManage={can(user, "team.manage")} />
    </div>
  );
}
