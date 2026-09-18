import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllJobsAdmin } from "@/lib/db/queries/careers";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { JobsTable } from "./jobs-table";

export default async function CareersPage() {
  await requireAdmin();
  const jobs = await getAllJobsAdmin();

  return (
    <div>
      <PageHeader
        title="Careers"
        description="Manage job openings shown on the Careers page."
        actions={
          <AdminButton href="/admin/careers/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Opening
          </AdminButton>
        }
      />
      <JobsTable jobs={jobs} />
    </div>
  );
}
