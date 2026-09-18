"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { projects, type Project } from "@/lib/db/schema";
import { projectSchema } from "@/lib/validation/projects";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateProjectPaths(slug?: string) {
  revalidatePath("/admin/projects");
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function createProjectAction(input: unknown): Promise<ActionResult<Project>> {
  await requireAdmin();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db.insert(projects).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create project." };
    revalidateProjectPaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function updateProjectAction(id: string, input: unknown): Promise<ActionResult<Project>> {
  await requireAdmin();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    if (!row) return { success: false, error: "Project not found." };
    revalidateProjectPaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const [row] = await db.delete(projects).where(eq(projects.id, id)).returning();
    revalidateProjectPaths(row?.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
