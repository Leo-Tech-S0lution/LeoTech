"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { services, type Service } from "@/lib/db/schema";
import { serviceSchema } from "@/lib/validation/services";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateServicePaths(slug?: string) {
  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/services");
  if (slug) revalidatePath(`/services/${slug}`);
}

export async function createServiceAction(input: unknown): Promise<ActionResult<Service>> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db.insert(services).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create service." };
    revalidateServicePaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function updateServiceAction(id: string, input: unknown): Promise<ActionResult<Service>> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .update(services)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    if (!row) return { success: false, error: "Service not found." };
    revalidateServicePaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const [row] = await db.delete(services).where(eq(services.id, id)).returning();
    revalidateServicePaths(row?.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
