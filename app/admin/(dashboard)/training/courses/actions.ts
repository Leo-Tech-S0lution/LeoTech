"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { trainingCourses, type TrainingCourse } from "@/lib/db/schema";
import { trainingCourseSchema } from "@/lib/validation/training";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateCoursePaths(slug?: string) {
  revalidatePath("/admin/training/courses");
  revalidatePath("/");
  revalidatePath("/training");
  if (slug) revalidatePath(`/training/${slug}`);
}

export async function createCourseAction(input: unknown): Promise<ActionResult<TrainingCourse>> {
  await requireAdmin();

  const parsed = trainingCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db.insert(trainingCourses).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create course." };
    revalidateCoursePaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function updateCourseAction(id: string, input: unknown): Promise<ActionResult<TrainingCourse>> {
  await requireAdmin();

  const parsed = trainingCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .update(trainingCourses)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(trainingCourses.id, id))
      .returning();
    if (!row) return { success: false, error: "Course not found." };
    revalidateCoursePaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function deleteCourseAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const [row] = await db.delete(trainingCourses).where(eq(trainingCourses.id, id)).returning();
    revalidateCoursePaths(row?.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
