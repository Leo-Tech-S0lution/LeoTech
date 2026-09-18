"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { heroSlides, type HeroSlide } from "@/lib/db/schema";
import { heroSlideSchema } from "@/lib/validation/content";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateHeroPaths() {
  revalidatePath("/admin/website/hero");
  revalidatePath("/");
}

export async function createHeroSlideAction(input: unknown): Promise<ActionResult<HeroSlide>> {
  await requireAdmin();

  const parsed = heroSlideSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db.insert(heroSlides).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create hero slide." };
    revalidateHeroPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateHeroSlideAction(id: string, input: unknown): Promise<ActionResult<HeroSlide>> {
  await requireAdmin();

  const parsed = heroSlideSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .update(heroSlides)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(heroSlides.id, id))
      .returning();
    if (!row) return { success: false, error: "Hero slide not found." };
    revalidateHeroPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteHeroSlideAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db.delete(heroSlides).where(eq(heroSlides.id, id)).returning();
    revalidateHeroPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
