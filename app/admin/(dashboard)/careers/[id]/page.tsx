import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getJobByIdAdmin } from "@/lib/db/queries/careers";
import { PageHeader } from "@/components/admin/page-header";
import { JobForm } from "../job-form";

export default async function EditJobOpeningPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const job = await getJobByIdAdmin(id);
  if (!job) notFound();

  return (
    <div>
      <PageHeader title="Edit Job Opening" description={job.title} />
      <JobForm job={job} />
    </div>
  );
}
