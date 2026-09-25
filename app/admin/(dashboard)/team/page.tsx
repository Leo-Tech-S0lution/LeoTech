import { Plus, QrCode } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { getAllTeamMembersAdmin } from "@/lib/db/queries/team";
import { profileCompleteness, profilePath, profileUrl, qrStatus } from "@/lib/team/profile";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { TeamTable, type TeamRow } from "./team-table";

export default async function TeamPage() {
  const user = await requireAdmin();
  const members = await getAllTeamMembersAdmin();

  const rows: TeamRow[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    position: m.position,
    department: m.department,
    employeeId: m.employeeId,
    image: m.image,
    order: m.order,
    published: m.published,
    isActive: m.isActive,
    isVerified: m.isVerified,
    qrVersion: m.qrVersion,
    qrStatus: qrStatus(m),
    profilePath: profilePath(m.slug),
    profileUrl: profileUrl(m.slug),
    completion: profileCompleteness(m).percent,
  }));

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage team members, their public digital profiles and ID-card QR codes."
        actions={
          <>
            <AdminButton href="/admin/qr-management" variant="outline" size="sm">
              <QrCode className="h-3.5 w-3.5" />
              QR Management
            </AdminButton>
            <AdminButton href="/admin/team/new" size="sm">
              <Plus className="h-3.5 w-3.5" />
              New Team Member
            </AdminButton>
          </>
        }
      />
      <TeamTable
        rows={rows}
        canManage={can(user, "team.manage")}
        canDelete={can(user, "team.delete")}
      />
    </div>
  );
}
