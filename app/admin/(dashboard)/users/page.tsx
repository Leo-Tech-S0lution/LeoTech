import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllAdminUsersAdmin } from "@/lib/db/queries/users";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { UsersTable } from "./users-table";

export default async function UsersPage() {
  const currentUser = await requireAdmin();
  const users = await getAllAdminUsersAdmin();

  return (
    <div>
      <PageHeader
        title="Users / Admin"
        description="Manage who can access the admin dashboard."
        actions={
          <AdminButton href="/admin/users/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New User
          </AdminButton>
        }
      />
      <UsersTable users={users} currentUserId={currentUser.id} />
    </div>
  );
}
