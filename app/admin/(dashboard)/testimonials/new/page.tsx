import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { TestimonialForm } from "../testimonial-form";

export default async function NewTestimonialPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New Testimonial" description="Add a new client testimonial." />
      <TestimonialForm />
    </div>
  );
}
