"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { technologyCategories, technologies, type TechnologyCategory, type Technology } from "@/lib/db/schema";
import { technologyCategorySchema, technologySchema } from "@/lib/validation/technologies";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateTechPaths() {
  revalidatePath("/admin/website/technologies");
  revalidatePath("/");
}

// --- Categories ---

export async function createTechCategoryAction(input: unknown): Promise<ActionResult<TechnologyCategory>> {
  await requireAdmin();
  const parsed = technologyCategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(technologyCategories).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create category." };
    revalidateTechPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function updateTechCategoryAction(id: string, input: unknown): Promise<ActionResult<TechnologyCategory>> {
  await requireAdmin();
  const parsed = technologyCategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db
      .update(technologyCategories)
      .set(parsed.data)
      .where(eq(technologyCategories.id, id))
      .returning();
    if (!row) return { success: false, error: "Category not found." };
    revalidateTechPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function deleteTechCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(technologyCategories).where(eq(technologyCategories.id, id));
    revalidateTechPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}

// --- Technologies ---

export async function createTechnologyAction(input: unknown): Promise<ActionResult<Technology>> {
  await requireAdmin();
  const parsed = technologySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(technologies).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create technology." };
    revalidateTechPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateTechnologyAction(id: string, input: unknown): Promise<ActionResult<Technology>> {
  await requireAdmin();
  const parsed = technologySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.update(technologies).set(parsed.data).where(eq(technologies.id, id)).returning();
    if (!row) return { success: false, error: "Technology not found." };
    revalidateTechPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteTechnologyAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(technologies).where(eq(technologies.id, id));
    revalidateTechPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
