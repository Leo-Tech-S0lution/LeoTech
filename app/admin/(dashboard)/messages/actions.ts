"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { contactSubmissions, type ContactSubmission } from "@/lib/db/schema";
import { updateInquiryStatusSchema } from "@/lib/validation/contact";
import { toActionError, type ActionResult } from "@/lib/validation/common";

export async function updateInquiryStatusAction(id: string, input: unknown): Promise<ActionResult<ContactSubmission>> {
  await requireAdmin();

  const parsed = updateInquiryStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .update(contactSubmissions)
      .set({ status: parsed.data.status })
      .where(eq(contactSubmissions.id, id))
      .returning();
    if (!row) return { success: false, error: "Inquiry not found." };
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}
