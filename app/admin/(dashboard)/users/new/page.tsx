import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "../user-form";

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New User" description="Create a new admin account." />
      <UserForm />
    </div>
  );
}
