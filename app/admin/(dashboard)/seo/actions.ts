"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { seoPages, type SeoPage } from "@/lib/db/schema";
import { seoPageSchema } from "@/lib/validation/seo";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateSeoPaths(path?: string) {
  revalidatePath("/admin/seo");
  if (path) revalidatePath(path);
}

export async function createSeoPageAction(input: unknown): Promise<ActionResult<SeoPage>> {
  await requireAdmin();
  const parsed = seoPageSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(seoPages).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create SEO entry." };
    revalidateSeoPaths(row.path);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "path");
  }
}

export async function updateSeoPageAction(id: string, input: unknown): Promise<ActionResult<SeoPage>> {
  await requireAdmin();
  const parsed = seoPageSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.update(seoPages).set(parsed.data).where(eq(seoPages.id, id)).returning();
    if (!row) return { success: false, error: "SEO entry not found." };
    revalidateSeoPaths(row.path);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "path");
  }
}

export async function deleteSeoPageAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const [row] = await db.delete(seoPages).where(eq(seoPages.id, id)).returning();
    revalidateSeoPaths(row?.path);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
