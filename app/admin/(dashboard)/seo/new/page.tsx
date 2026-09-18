import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { SeoPageForm } from "../seo-page-form";

export default async function NewSeoPagePage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New SEO Entry" description="Add an SEO override for a static route." />
      <SeoPageForm />
    </div>
  );
}
