import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import { getHeroSlideByIdAdmin } from "@/lib/db/queries/content";
import { PageHeader } from "@/components/admin/page-header";
import { HeroSlideForm } from "../hero-slide-form";

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const slide = await getHeroSlideByIdAdmin(id);
  if (!slide) notFound();

  return (
    <div>
      <PageHeader title="Edit Hero Slide" description={slide.title.split("\n")[0]} />
      <HeroSlideForm slide={slide} />
    </div>
  );
}
