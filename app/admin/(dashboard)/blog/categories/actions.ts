"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { blogCategories, blogTags, type BlogCategory, type BlogTag } from "@/lib/db/schema";
import { blogCategorySchema, blogTagSchema } from "@/lib/validation/blog";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateBlogPaths() {
  revalidatePath("/admin/blog/categories");
  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
}

// --- Categories ---

export async function createBlogCategoryAction(input: unknown): Promise<ActionResult<BlogCategory>> {
  await requireAdmin();
  const parsed = blogCategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(blogCategories).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create category." };
    revalidateBlogPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function updateBlogCategoryAction(id: string, input: unknown): Promise<ActionResult<BlogCategory>> {
  await requireAdmin();
  const parsed = blogCategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.update(blogCategories).set(parsed.data).where(eq(blogCategories.id, id)).returning();
    if (!row) return { success: false, error: "Category not found." };
    revalidateBlogPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function deleteBlogCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(blogCategories).where(eq(blogCategories.id, id));
    revalidateBlogPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}

// --- Tags ---

export async function createBlogTagAction(input: unknown): Promise<ActionResult<BlogTag>> {
  await requireAdmin();
  const parsed = blogTagSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.insert(blogTags).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create tag." };
    revalidateBlogPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function updateBlogTagAction(id: string, input: unknown): Promise<ActionResult<BlogTag>> {
  await requireAdmin();
  const parsed = blogTagSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  try {
    const [row] = await db.update(blogTags).set(parsed.data).where(eq(blogTags.id, id)).returning();
    if (!row) return { success: false, error: "Tag not found." };
    revalidateBlogPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function deleteBlogTagAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(blogTags).where(eq(blogTags.id, id));
    revalidateBlogPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
