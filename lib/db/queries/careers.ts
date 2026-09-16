import "server-only";
import { db } from "@/lib/db";
import { jobOpenings, type JobOpening } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function getOpenJobs(): Promise<JobOpening[]> {
  return db
    .select()
    .from(jobOpenings)
    .where(eq(jobOpenings.status, "open"))
    .orderBy(desc(jobOpenings.createdAt));
}

export async function getJobBySlug(slug: string): Promise<JobOpening | null> {
  const [row] = await db
    .select()
    .from(jobOpenings)
    .where(and(eq(jobOpenings.slug, slug), eq(jobOpenings.status, "open")))
    .limit(1);
  return row ?? null;
}

export async function getAllJobsAdmin(): Promise<JobOpening[]> {
  return db.select().from(jobOpenings).orderBy(desc(jobOpenings.createdAt));
}

export async function getJobByIdAdmin(id: string): Promise<JobOpening | null> {
  const [row] = await db.select().from(jobOpenings).where(eq(jobOpenings.id, id)).limit(1);
  return row ?? null;
}
