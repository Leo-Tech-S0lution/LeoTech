import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAllHeroSlidesAdmin } from "@/lib/db/queries/content";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { HeroSlidesTable } from "./hero-slides-table";

export default async function HeroSlidesPage() {
  await requireAdmin();
  const slides = await getAllHeroSlidesAdmin();

  return (
    <div>
      <PageHeader
        title="Hero Slides"
        description="Manage the homepage hero carousel."
        actions={
          <AdminButton href="/admin/website/hero/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Slide
          </AdminButton>
        }
      />
      <HeroSlidesTable slides={slides} />
    </div>
  );
}
