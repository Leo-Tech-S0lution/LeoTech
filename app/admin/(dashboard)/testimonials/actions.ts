"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { testimonials, type Testimonial } from "@/lib/db/schema";
import { testimonialSchema } from "@/lib/validation/testimonials";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateTestimonialPaths() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function createTestimonialAction(input: unknown): Promise<ActionResult<Testimonial>> {
  await requireAdmin();

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db.insert(testimonials).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create testimonial." };
    revalidateTestimonialPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateTestimonialAction(id: string, input: unknown): Promise<ActionResult<Testimonial>> {
  await requireAdmin();

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .update(testimonials)
      .set(parsed.data)
      .where(eq(testimonials.id, id))
      .returning();
    if (!row) return { success: false, error: "Testimonial not found." };
    revalidateTestimonialPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db.delete(testimonials).where(eq(testimonials.id, id)).returning();
    revalidateTestimonialPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
