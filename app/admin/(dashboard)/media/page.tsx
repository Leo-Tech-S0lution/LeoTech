import { requireAdmin } from "@/lib/auth/guard";
import { getAllMedia } from "@/lib/db/queries/media";
import { PageHeader } from "@/components/admin/page-header";
import { MediaLibrary } from "@/components/admin/media-library";

export default async function MediaPage() {
  await requireAdmin();
  const items = await getAllMedia();

  return (
    <div>
      <PageHeader title="Media Library" description="Images used across services, projects, team, blog, and more." />
      <MediaLibrary initialItems={items} />
    </div>
  );
}
