import { requireAdmin } from "@/lib/auth/guard";
import { getAllStatisticsAdmin, getAllWhyLeotechItemsAdmin, getAllProcessStepsAdmin } from "@/lib/db/queries/content";
import { PageHeader } from "@/components/admin/page-header";
import { StatisticsManager } from "./statistics-manager";
import { IconItemManager } from "./icon-item-manager";
import {
  createWhyLeotechItemAction,
  updateWhyLeotechItemAction,
  deleteWhyLeotechItemAction,
  createProcessStepAction,
  updateProcessStepAction,
  deleteProcessStepAction,
} from "./actions";

export default async function AboutContentPage() {
  await requireAdmin();
  const [statistics, whyItems, processSteps] = await Promise.all([
    getAllStatisticsAdmin(),
    getAllWhyLeotechItemsAdmin(),
    getAllProcessStepsAdmin(),
  ]);

  return (
    <div>
      <PageHeader
        title="About"
        description="Manage the statistics, 'Why LeoTech' points, and process steps shown across the site."
      />
      <div className="space-y-6">
        <StatisticsManager statistics={statistics} />
        <IconItemManager
          title="Why LeoTech"
          hint="Trust-building points shown on the homepage and About page."
          items={whyItems}
          createAction={createWhyLeotechItemAction}
          updateAction={updateWhyLeotechItemAction}
          deleteAction={deleteWhyLeotechItemAction}
        />
        <IconItemManager
          title="Our Process"
          hint="The Discover → Support timeline shown on the homepage."
          items={processSteps}
          createAction={createProcessStepAction}
          updateAction={updateProcessStepAction}
          deleteAction={deleteProcessStepAction}
        />
      </div>
    </div>
  );
}
