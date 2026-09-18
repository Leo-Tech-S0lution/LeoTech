import { requireAdmin } from "@/lib/auth/guard";
import { getTechnologyCategoriesAdmin } from "@/lib/db/queries/technologies";
import { db } from "@/lib/db";
import { technologies as technologiesTable } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryManager } from "./category-manager";
import type { Technology } from "@/lib/db/schema";

export default async function TechnologiesPage() {
  await requireAdmin();
  const [categories, allTechnologies] = await Promise.all([
    getTechnologyCategoriesAdmin(),
    db.select().from(technologiesTable).orderBy(asc(technologiesTable.order)),
  ]);

  const technologiesByCategory: Record<string, Technology[]> = {};
  for (const tech of allTechnologies) {
    (technologiesByCategory[tech.categoryId] ??= []).push(tech);
  }

  return (
    <div>
      <PageHeader
        title="Technology Stack"
        description="Manage the technology categories and items shown on the homepage."
      />
      <CategoryManager categories={categories} technologiesByCategory={technologiesByCategory} />
    </div>
  );
}
