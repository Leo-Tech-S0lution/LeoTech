"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { faqs, type Faq } from "@/lib/db/schema";
import { faqSchema } from "@/lib/validation/content";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateFaqPaths() {
  revalidatePath("/admin/website/faq");
  revalidatePath("/");
  revalidatePath("/contact");
}

export async function createFaqAction(input: unknown): Promise<ActionResult<Faq>> {
  await requireAdmin();
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(faqs).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create FAQ." };
    revalidateFaqPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateFaqAction(id: string, input: unknown): Promise<ActionResult<Faq>> {
  await requireAdmin();
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.update(faqs).set(parsed.data).where(eq(faqs.id, id)).returning();
    if (!row) return { success: false, error: "FAQ not found." };
    revalidateFaqPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(faqs).where(eq(faqs.id, id));
    revalidateFaqPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
