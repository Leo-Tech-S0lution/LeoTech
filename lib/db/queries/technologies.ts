import "server-only";
import { db } from "@/lib/db";
import { technologyCategories, technologies } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

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
