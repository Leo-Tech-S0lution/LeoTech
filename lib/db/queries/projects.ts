import "server-only";
import { db } from "@/lib/db";
import { projects, type Project } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function getPublishedProjects(): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.order));
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.status, "published"), eq(projects.featured, true)))
    .orderBy(asc(projects.order));
  return rows.length ? rows.slice(0, limit) : (await getPublishedProjects()).slice(0, limit);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.status, "published")))
    .limit(1);
  return row ?? null;
}

export async function getAllProjectsAdmin(): Promise<Project[]> {
  return db.select().from(projects).orderBy(asc(projects.order));
}

export async function getProjectByIdAdmin(id: string): Promise<Project | null> {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row ?? null;
}
