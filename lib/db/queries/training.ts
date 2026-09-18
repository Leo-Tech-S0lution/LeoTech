import "server-only";
import { db } from "@/lib/db";
import {
  trainingCourses,
  internshipPrograms,
  type TrainingCourse,
  type InternshipProgram,
} from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function getPublishedCourses(): Promise<TrainingCourse[]> {
  return db
    .select()
    .from(trainingCourses)
    .where(eq(trainingCourses.status, "published"))
    .orderBy(asc(trainingCourses.order));
}

export async function getFeaturedCourses(limit = 6): Promise<TrainingCourse[]> {
  const rows = await db
    .select()
    .from(trainingCourses)
    .where(and(eq(trainingCourses.status, "published"), eq(trainingCourses.featured, true)))
    .orderBy(asc(trainingCourses.order));
  return rows.length ? rows.slice(0, limit) : (await getPublishedCourses()).slice(0, limit);
}

export async function getCourseBySlug(slug: string): Promise<TrainingCourse | null> {
  const [row] = await db
    .select()
    .from(trainingCourses)
    .where(and(eq(trainingCourses.slug, slug), eq(trainingCourses.status, "published")))
    .limit(1);
  return row ?? null;
}

export async function getPublishedInternshipPrograms(): Promise<InternshipProgram[]> {
  return db
    .select()
    .from(internshipPrograms)
    .where(eq(internshipPrograms.status, "published"))
    .orderBy(asc(internshipPrograms.order));
}

// --- Admin ---

export async function getAllCoursesAdmin(): Promise<TrainingCourse[]> {
  return db.select().from(trainingCourses).orderBy(asc(trainingCourses.order));
}

export async function getCourseByIdAdmin(id: string): Promise<TrainingCourse | null> {
  const [row] = await db.select().from(trainingCourses).where(eq(trainingCourses.id, id)).limit(1);
  return row ?? null;
}

export async function getAllInternshipProgramsAdmin(): Promise<InternshipProgram[]> {
  return db.select().from(internshipPrograms).orderBy(asc(internshipPrograms.order));
}

export async function getInternshipProgramByIdAdmin(id: string): Promise<InternshipProgram | null> {
  const [row] = await db.select().from(internshipPrograms).where(eq(internshipPrograms.id, id)).limit(1);
  return row ?? null;
}
