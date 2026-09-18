import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminUserByIdAdmin } from "@/lib/db/queries/users";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "../user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const user = await getAdminUserByIdAdmin(id);
  if (!user) notFound();

  return (
    <div>
      <PageHeader title="Edit User" description={user.name} />
      <UserForm user={user} />
    </div>
  );
}
