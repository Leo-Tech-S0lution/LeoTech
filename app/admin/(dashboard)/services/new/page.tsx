import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "../service-form";

export default async function NewServicePage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New Service" description="Create a new service entry." />
      <ServiceForm />
    </div>
  );
}
