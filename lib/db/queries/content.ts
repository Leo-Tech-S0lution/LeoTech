import "server-only";
import { db } from "@/lib/db";
import {
  homepageSections,
  heroSlides,
  statistics,
  processSteps,
  whyLeotechItems,
  faqs,
  type HomepageSection,
} from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getHomepageSectionsMap(): Promise<Record<string, HomepageSection>> {
  const rows = await db.select().from(homepageSections).orderBy(asc(homepageSections.order));
  return Object.fromEntries(rows.map((r) => [r.sectionKey, r]));
}

export async function getActiveHeroSlides() {
  return db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.active, true))
    .orderBy(asc(heroSlides.order));
}

export async function getStatistics() {
  return db.select().from(statistics).orderBy(asc(statistics.order));
}

export async function getProcessSteps() {
  return db.select().from(processSteps).orderBy(asc(processSteps.order));
}

export async function getWhyLeotechItems() {
  return db.select().from(whyLeotechItems).orderBy(asc(whyLeotechItems.order));
}

export async function getPublishedFaqs() {
  return db.select().from(faqs).where(eq(faqs.published, true)).orderBy(asc(faqs.order));
}
