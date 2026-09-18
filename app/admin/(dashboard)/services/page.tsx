import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllServicesAdmin } from "@/lib/db/queries/services";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { ServicesTable } from "./services-table";

export default async function ServicesPage() {
  await requireAdmin();
  const services = await getAllServicesAdmin();

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the services shown on the public site."
        actions={
          <AdminButton href="/admin/services/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Service
          </AdminButton>
        }
      />
      <ServicesTable services={services} />
    </div>
  );
}
