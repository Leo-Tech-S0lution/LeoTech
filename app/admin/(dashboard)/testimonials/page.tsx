import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllTestimonialsAdmin } from "@/lib/db/queries/testimonials";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { TestimonialsTable } from "./testimonials-table";

export default async function TestimonialsPage() {
  await requireAdmin();
  const testimonials = await getAllTestimonialsAdmin();

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Manage client testimonials shown across the site."
        actions={
          <AdminButton href="/admin/testimonials/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Testimonial
          </AdminButton>
        }
      />
      <TestimonialsTable testimonials={testimonials} />
    </div>
  );
}
