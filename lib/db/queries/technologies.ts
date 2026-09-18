import "server-only";
import { db } from "@/lib/db";
import { technologyCategories, technologies } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export interface TechCategoryWithItems {
  id: string;
  name: string;
  slug: string;
  items: { id: string; name: string; icon: string | null }[];
}

export async function getTechnologiesByCategory(): Promise<TechCategoryWithItems[]> {
  const categories = await db
    .select()
    .from(technologyCategories)
    .orderBy(asc(technologyCategories.order));
  const items = await db.select().from(technologies).orderBy(asc(technologies.order));

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    items: items
      .filter((i) => i.categoryId === cat.id)
      .map((i) => ({ id: i.id, name: i.name, icon: i.icon })),
  }));
}

// --- Admin ---

export async function getTechnologyCategoriesAdmin() {
  return db.select().from(technologyCategories).orderBy(asc(technologyCategories.order));
}

export async function getTechnologyCategoryByIdAdmin(id: string) {
  const [row] = await db
    .select()
    .from(technologyCategories)
    .where(eq(technologyCategories.id, id))
    .limit(1);
  return row ?? null;
}

export async function getTechnologyByIdAdmin(id: string) {
  const [row] = await db.select().from(technologies).where(eq(technologies.id, id)).limit(1);
  return row ?? null;
}

export async function getTechnologiesByCategoryIdAdmin(categoryId: string) {
  return db
    .select()
    .from(technologies)
    .where(eq(technologies.categoryId, categoryId))
    .orderBy(asc(technologies.order));
}
