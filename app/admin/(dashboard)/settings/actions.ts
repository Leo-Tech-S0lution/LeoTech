"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { siteSettings, type SiteSettings } from "@/lib/db/schema";
import { siteSettingsSchema } from "@/lib/validation/settings";
import { toActionError, type ActionResult } from "@/lib/validation/common";

export async function updateSiteSettingsAction(input: unknown): Promise<ActionResult<SiteSettings>> {
  await requireAdmin();

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .insert(siteSettings)
      .values({ id: 1, ...parsed.data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { ...parsed.data, updatedAt: new Date() },
      })
      .returning();

    if (!row) return { success: false, error: "Could not save settings." };

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}
