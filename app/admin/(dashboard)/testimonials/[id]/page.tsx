import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getTestimonialByIdAdmin } from "@/lib/db/queries/testimonials";
import { PageHeader } from "@/components/admin/page-header";
import { TestimonialForm } from "../testimonial-form";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const testimonial = await getTestimonialByIdAdmin(id);
  if (!testimonial) notFound();

  return (
    <div>
      <PageHeader title="Edit Testimonial" description={testimonial.name} />
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
