"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { internshipPrograms, type InternshipProgram } from "@/lib/db/schema";
import { internshipProgramSchema } from "@/lib/validation/training";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateInternshipPaths() {
  revalidatePath("/admin/training/internships");
  revalidatePath("/");
  revalidatePath("/internships");
  revalidatePath("/training");
}

export async function createInternshipAction(input: unknown): Promise<ActionResult<InternshipProgram>> {
  await requireAdmin();

  const parsed = internshipProgramSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db.insert(internshipPrograms).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create internship program." };
    revalidateInternshipPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateInternshipAction(id: string, input: unknown): Promise<ActionResult<InternshipProgram>> {
  await requireAdmin();

  const parsed = internshipProgramSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .update(internshipPrograms)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(internshipPrograms.id, id))
      .returning();
    if (!row) return { success: false, error: "Internship program not found." };
    revalidateInternshipPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteInternshipAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db.delete(internshipPrograms).where(eq(internshipPrograms.id, id)).returning();
    revalidateInternshipPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
