import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getFaqByIdAdmin } from "@/lib/db/queries/content";
import { PageHeader } from "@/components/admin/page-header";
import { FaqForm } from "../faq-form";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const faq = await getFaqByIdAdmin(id);
  if (!faq) notFound();

  return (
    <div>
      <PageHeader title="Edit FAQ" description={faq.question} />
      <FaqForm faq={faq} />
    </div>
  );
}
