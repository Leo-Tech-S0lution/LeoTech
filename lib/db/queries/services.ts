import "server-only";
import { db } from "@/lib/db";
import { services, type Service } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function getPublishedServices(): Promise<Service[]> {
  return db
    .select()
    .from(services)
    .where(eq(services.status, "published"))
    .orderBy(asc(services.order));
}

export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  const rows = await db
    .select()
    .from(services)
    .where(and(eq(services.status, "published"), eq(services.featured, true)))
    .orderBy(asc(services.order));
  return rows.length ? rows.slice(0, limit) : (await getPublishedServices()).slice(0, limit);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const [row] = await db
    .select()
    .from(services)
    .where(and(eq(services.slug, slug), eq(services.status, "published")))
    .limit(1);
  return row ?? null;
}

// --- Admin (all statuses) ---

export async function getAllServicesAdmin(): Promise<Service[]> {
  return db.select().from(services).orderBy(asc(services.order));
}

export async function getServiceByIdAdmin(id: string): Promise<Service | null> {
  const [row] = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return row ?? null;
}
