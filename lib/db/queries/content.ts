import "server-only";
import { db } from "@/lib/db";
import {
  homepageSections,
  heroSlides,
  statistics,
  processSteps,
  whyLeotechItems,
  faqs,
  seoPages,
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

// --- Admin ---

export async function getAllHomepageSectionsAdmin() {
  return db.select().from(homepageSections).orderBy(asc(homepageSections.order));
}

export async function getHomepageSectionByIdAdmin(id: string) {
  const [row] = await db.select().from(homepageSections).where(eq(homepageSections.id, id)).limit(1);
  return row ?? null;
}

export async function getAllHeroSlidesAdmin() {
  return db.select().from(heroSlides).orderBy(asc(heroSlides.order));
}

export async function getHeroSlideByIdAdmin(id: string) {
  const [row] = await db.select().from(heroSlides).where(eq(heroSlides.id, id)).limit(1);
  return row ?? null;
}

export async function getAllStatisticsAdmin() {
  return db.select().from(statistics).orderBy(asc(statistics.order));
}

export async function getStatisticByIdAdmin(id: string) {
  const [row] = await db.select().from(statistics).where(eq(statistics.id, id)).limit(1);
  return row ?? null;
}

export async function getAllProcessStepsAdmin() {
  return db.select().from(processSteps).orderBy(asc(processSteps.order));
}

export async function getProcessStepByIdAdmin(id: string) {
  const [row] = await db.select().from(processSteps).where(eq(processSteps.id, id)).limit(1);
  return row ?? null;
}

export async function getAllWhyLeotechItemsAdmin() {
  return db.select().from(whyLeotechItems).orderBy(asc(whyLeotechItems.order));
}

export async function getWhyLeotechItemByIdAdmin(id: string) {
  const [row] = await db.select().from(whyLeotechItems).where(eq(whyLeotechItems.id, id)).limit(1);
  return row ?? null;
}

export async function getAllFaqsAdmin() {
  return db.select().from(faqs).orderBy(asc(faqs.order));
}

export async function getFaqByIdAdmin(id: string) {
  const [row] = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  return row ?? null;
}

export async function getAllSeoPagesAdmin() {
  return db.select().from(seoPages).orderBy(asc(seoPages.path));
}

export async function getSeoPageByIdAdmin(id: string) {
  const [row] = await db.select().from(seoPages).where(eq(seoPages.id, id)).limit(1);
  return row ?? null;
}
