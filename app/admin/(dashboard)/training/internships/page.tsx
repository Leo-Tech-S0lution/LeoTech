import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllInternshipProgramsAdmin } from "@/lib/db/queries/training";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { InternshipsTable } from "./internships-table";

export default async function InternshipsPage() {
  await requireAdmin();
  const programs = await getAllInternshipProgramsAdmin();

  return (
    <div>
      <PageHeader
        title="Internship Programs"
        description="Manage the internship programs shown on the Internships page."
        actions={
          <AdminButton href="/admin/training/internships/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Program
          </AdminButton>
        }
      />
      <InternshipsTable programs={programs} />
    </div>
  );
}
