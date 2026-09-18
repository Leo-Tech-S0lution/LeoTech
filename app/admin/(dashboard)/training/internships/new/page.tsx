import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { InternshipForm } from "../internship-form";

export default async function NewInternshipPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New Internship Program" description="Create a new internship program." />
      <InternshipForm />
    </div>
  );
}
