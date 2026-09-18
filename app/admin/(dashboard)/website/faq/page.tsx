import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllFaqsAdmin } from "@/lib/db/queries/content";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { FaqsTable } from "./faqs-table";

export default async function FaqsPage() {
  await requireAdmin();
  const faqs = await getAllFaqsAdmin();

  return (
    <div>
      <PageHeader
        title="FAQ"
        description="Manage the frequently asked questions shown on the Contact page."
        actions={
          <AdminButton href="/admin/website/faq/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New FAQ
          </AdminButton>
        }
      />
      <FaqsTable faqs={faqs} />
    </div>
  );
}
