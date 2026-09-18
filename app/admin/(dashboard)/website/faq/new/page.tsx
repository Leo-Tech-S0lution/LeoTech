import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { FaqForm } from "../faq-form";

export default async function NewFaqPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New FAQ" description="Add a new frequently asked question." />
      <FaqForm />
    </div>
  );
}
