import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllTeamMembersAdmin } from "@/lib/db/queries/team";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { TeamTable } from "./team-table";

export default async function TeamPage() {
  await requireAdmin();
  const members = await getAllTeamMembersAdmin();

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage the team members shown on the About page and homepage."
        actions={
          <AdminButton href="/admin/team/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Team Member
          </AdminButton>
        }
      />
      <TeamTable members={members} />
    </div>
  );
}
