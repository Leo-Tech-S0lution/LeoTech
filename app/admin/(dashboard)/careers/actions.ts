"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { jobOpenings, type JobOpening } from "@/lib/db/schema";
import { jobOpeningSchema } from "@/lib/validation/careers";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateCareerPaths(slug?: string) {
  revalidatePath("/admin/careers");
  revalidatePath("/careers");
  if (slug) revalidatePath(`/careers/${slug}`);
}

export async function createJobOpeningAction(input: unknown): Promise<ActionResult<JobOpening>> {
  await requireAdmin();
  const parsed = jobOpeningSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(jobOpenings).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create job opening." };
    revalidateCareerPaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function updateJobOpeningAction(id: string, input: unknown): Promise<ActionResult<JobOpening>> {
  await requireAdmin();
  const parsed = jobOpeningSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db
      .update(jobOpenings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(jobOpenings.id, id))
      .returning();
    if (!row) return { success: false, error: "Job opening not found." };
    revalidateCareerPaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function deleteJobOpeningAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const [row] = await db.delete(jobOpenings).where(eq(jobOpenings.id, id)).returning();
    revalidateCareerPaths(row?.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
