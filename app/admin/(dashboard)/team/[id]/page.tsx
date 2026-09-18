import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getTeamMemberByIdAdmin } from "@/lib/db/queries/team";
import { PageHeader } from "@/components/admin/page-header";
import { TeamForm } from "../team-form";

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const member = await getTeamMemberByIdAdmin(id);
  if (!member) notFound();

  return (
    <div>
      <PageHeader title="Edit Team Member" description={member.name} />
      <TeamForm member={member} />
    </div>
  );
}
