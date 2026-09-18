import { requireAdmin } from "@/lib/auth/guard";
import { PageHeader } from "@/components/admin/page-header";
import { HeroSlideForm } from "../hero-slide-form";

export default async function NewHeroSlidePage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="New Hero Slide" description="Add a new homepage hero slide." />
      <HeroSlideForm />
    </div>
  );
}
