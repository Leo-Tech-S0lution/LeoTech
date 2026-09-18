import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getInternshipProgramByIdAdmin } from "@/lib/db/queries/training";
import { PageHeader } from "@/components/admin/page-header";
import { InternshipForm } from "../internship-form";

export default async function EditInternshipPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const program = await getInternshipProgramByIdAdmin(id);
  if (!program) notFound();

  return (
    <div>
      <PageHeader title="Edit Internship Program" description={program.title} />
      <InternshipForm program={program} />
    </div>
  );
}
