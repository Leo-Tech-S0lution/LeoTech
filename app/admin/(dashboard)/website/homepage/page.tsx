import { requireAdmin } from "@/lib/auth/guard";
import { getAllHomepageSectionsAdmin } from "@/lib/db/queries/content";
import { PageHeader } from "@/components/admin/page-header";
import { SectionRow } from "./section-row";

export default async function HomepageSectionsPage() {
  await requireAdmin();
  const sections = await getAllHomepageSectionsAdmin();

  return (
    <div>
      <PageHeader
        title="Homepage Sections"
        description="Enable or disable homepage sections and override their heading/description."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <SectionRow key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
