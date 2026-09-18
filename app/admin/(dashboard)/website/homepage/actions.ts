"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { homepageSections, type HomepageSection } from "@/lib/db/schema";
import { homepageSectionSchema } from "@/lib/validation/content";
import { toActionError, type ActionResult } from "@/lib/validation/common";

export async function updateHomepageSectionAction(
  id: string,
  input: unknown,
): Promise<ActionResult<HomepageSection>> {
  await requireAdmin();

  const parsed = homepageSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .update(homepageSections)
      .set(parsed.data)
      .where(eq(homepageSections.id, id))
      .returning();
    if (!row) return { success: false, error: "Section not found." };
    revalidatePath("/admin/website/homepage");
    revalidatePath("/");
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}
