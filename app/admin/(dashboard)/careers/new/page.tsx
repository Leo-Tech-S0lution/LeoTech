import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { JobForm } from "../job-form";

export default async function NewJobOpeningPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New Job Opening" description="Create a new career opening." />
      <JobForm />
    </div>
  );
}
