import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllSeoPagesAdmin } from "@/lib/db/queries/content";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { SeoPagesTable } from "./seo-pages-table";

export default async function SeoPagesPage() {
  await requireAdmin();
  const pages = await getAllSeoPagesAdmin();

  return (
    <div>
      <PageHeader
        title="SEO"
        description="Override the title, description, and OG image for static routes (home, about, contact, etc.)."
        actions={
          <AdminButton href="/admin/seo/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Entry
          </AdminButton>
        }
      />
      <SeoPagesTable pages={pages} />
    </div>
  );
}
