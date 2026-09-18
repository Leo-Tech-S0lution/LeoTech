"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import {
  statistics,
  whyLeotechItems,
  processSteps,
  type Statistic,
  type WhyLeotechItem,
  type ProcessStep,
} from "@/lib/db/schema";
import { statisticSchema, whyLeotechItemSchema, processStepSchema } from "@/lib/validation/content";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateAboutPaths() {
  revalidatePath("/admin/website/about");
  revalidatePath("/");
  revalidatePath("/about");
}

// --- Statistics ---

export async function createStatisticAction(input: unknown): Promise<ActionResult<Statistic>> {
  await requireAdmin();
  const parsed = statisticSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(statistics).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create statistic." };
    revalidateAboutPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateStatisticAction(id: string, input: unknown): Promise<ActionResult<Statistic>> {
  await requireAdmin();
  const parsed = statisticSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.update(statistics).set(parsed.data).where(eq(statistics.id, id)).returning();
    if (!row) return { success: false, error: "Statistic not found." };
    revalidateAboutPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteStatisticAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(statistics).where(eq(statistics.id, id));
    revalidateAboutPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}

// --- Why LeoTech items ---

export async function createWhyLeotechItemAction(input: unknown): Promise<ActionResult<WhyLeotechItem>> {
  await requireAdmin();
  const parsed = whyLeotechItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(whyLeotechItems).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create item." };
    revalidateAboutPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateWhyLeotechItemAction(id: string, input: unknown): Promise<ActionResult<WhyLeotechItem>> {
  await requireAdmin();
  const parsed = whyLeotechItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.update(whyLeotechItems).set(parsed.data).where(eq(whyLeotechItems.id, id)).returning();
    if (!row) return { success: false, error: "Item not found." };
    revalidateAboutPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteWhyLeotechItemAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(whyLeotechItems).where(eq(whyLeotechItems.id, id));
    revalidateAboutPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}

// --- Process steps ---

export async function createProcessStepAction(input: unknown): Promise<ActionResult<ProcessStep>> {
  await requireAdmin();
  const parsed = processStepSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(processSteps).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create step." };
    revalidateAboutPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateProcessStepAction(id: string, input: unknown): Promise<ActionResult<ProcessStep>> {
  await requireAdmin();
  const parsed = processStepSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.update(processSteps).set(parsed.data).where(eq(processSteps.id, id)).returning();
    if (!row) return { success: false, error: "Step not found." };
    revalidateAboutPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteProcessStepAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(processSteps).where(eq(processSteps.id, id));
    revalidateAboutPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
