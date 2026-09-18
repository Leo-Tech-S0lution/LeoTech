import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getServiceByIdAdmin } from "@/lib/db/queries/services";
import { PageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "../service-form";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const service = await getServiceByIdAdmin(id);
  if (!service) notFound();

  return (
    <div>
      <PageHeader title="Edit Service" description={service.title} />
      <ServiceForm service={service} />
    </div>
  );
}
