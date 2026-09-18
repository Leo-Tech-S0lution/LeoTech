import { requireAdmin } from "@/lib/auth/guard";
import { AdminShell } from "@/components/admin/shell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <AdminShell userName={user.name} userRole={user.role}>
      {children}
    </AdminShell>
  );
}
