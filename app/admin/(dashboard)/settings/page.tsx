import { requireAdmin } from "@/lib/auth/guard";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "./settings-form";

export default async function SiteSettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <div>
      <PageHeader title="Site Settings" description="Company info, contact details, social links, and default SEO." />
      <SettingsForm settings={settings} />
    </div>
  );
}
