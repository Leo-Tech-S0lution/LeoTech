import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getSeoPageByIdAdmin } from "@/lib/db/queries/content";
import { PageHeader } from "@/components/admin/page-header";
import { SeoPageForm } from "../seo-page-form";

export default async function EditSeoPagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const seoPage = await getSeoPageByIdAdmin(id);
  if (!seoPage) notFound();

  return (
    <div>
      <PageHeader title="Edit SEO Entry" description={seoPage.path} />
      <SeoPageForm seoPage={seoPage} />
    </div>
  );
}
