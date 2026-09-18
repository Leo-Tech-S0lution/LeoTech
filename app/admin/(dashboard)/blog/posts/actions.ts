"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import DOMPurify from "isomorphic-dompurify";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { blogPosts, blogPostTags, type BlogPost } from "@/lib/db/schema";
import { blogPostSchema } from "@/lib/validation/blog";
import { toActionError, type ActionResult } from "@/lib/validation/common";
import { estimateReadingTime } from "@/lib/utils/text";

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/admin/blog/posts");
  revalidatePath("/");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function syncTags(postId: string, tagIds: string[]) {
  await db.delete(blogPostTags).where(eq(blogPostTags.postId, postId));
  if (tagIds.length > 0) {
    await db.insert(blogPostTags).values(tagIds.map((tagId) => ({ postId, tagId })));
  }
}

export async function createBlogPostAction(input: unknown): Promise<ActionResult<BlogPost>> {
  const admin = await requireAdmin();

  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { tagIds, publishedAt, ...rest } = parsed.data;
  const safeContent = DOMPurify.sanitize(rest.content);

  try {
    const [row] = await db
      .insert(blogPosts)
      .values({
        ...rest,
        content: safeContent,
        categoryId: rest.categoryId ?? null,
        authorId: rest.authorId ?? null,
        createdByAdminId: admin.id,
        readingTimeMinutes: estimateReadingTime(safeContent),
        publishedAt: publishedAt
          ? new Date(publishedAt)
          : rest.status === "published"
            ? new Date()
            : null,
      })
      .returning();
    if (!row) return { success: false, error: "Could not create post." };

    await syncTags(row.id, tagIds);
    revalidateBlogPaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function updateBlogPostAction(id: string, input: unknown): Promise<ActionResult<BlogPost>> {
  await requireAdmin();

  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { tagIds, publishedAt, ...rest } = parsed.data;
  const safeContent = DOMPurify.sanitize(rest.content);

  try {
    const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!existing) return { success: false, error: "Post not found." };

    const nextPublishedAt = publishedAt
      ? new Date(publishedAt)
      : rest.status === "published"
        ? (existing.publishedAt ?? new Date())
        : existing.publishedAt;

    const [row] = await db
      .update(blogPosts)
      .set({
        ...rest,
        content: safeContent,
        categoryId: rest.categoryId ?? null,
        authorId: rest.authorId ?? null,
        readingTimeMinutes: estimateReadingTime(safeContent),
        publishedAt: nextPublishedAt,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    if (!row) return { success: false, error: "Post not found." };

    await syncTags(row.id, tagIds);
    revalidateBlogPaths(row.slug);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug");
  }
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const [row] = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    revalidateBlogPaths(row?.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
