import "server-only";
import { db } from "@/lib/db";
import {
  blogPosts,
  blogCategories,
  blogTags,
  blogPostTags,
  teamMembers,
  type BlogPost,
} from "@/lib/db/schema";
import { and, asc, desc, eq, inArray } from "drizzle-orm";

export interface BlogPostWithRelations extends BlogPost {
  category: { id: string; name: string; slug: string } | null;
  author: { id: string; name: string; image: string | null } | null;
  tags: { id: string; name: string; slug: string }[];
}

async function attachTags(posts: BlogPost[]) {
  if (posts.length === 0) return new Map<string, { id: string; name: string; slug: string }[]>();
  const postIds = posts.map((p) => p.id);
  const tagRows = await db
    .select({
      postId: blogPostTags.postId,
      tag: blogTags,
    })
    .from(blogPostTags)
    .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(inArray(blogPostTags.postId, postIds));

  const tagsByPost = new Map<string, { id: string; name: string; slug: string }[]>();
  for (const row of tagRows) {
    const list = tagsByPost.get(row.postId) ?? [];
    list.push({ id: row.tag.id, name: row.tag.name, slug: row.tag.slug });
    tagsByPost.set(row.postId, list);
  }
  return tagsByPost;
}

export async function getPublishedBlogPosts(): Promise<BlogPostWithRelations[]> {
  const rows = await db
    .select({
      post: blogPosts,
      category: blogCategories,
      author: teamMembers,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .leftJoin(teamMembers, eq(blogPosts.authorId, teamMembers.id))
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));

  const tagsByPost = await attachTags(rows.map((r) => r.post));

  return rows.map((r) => ({
    ...r.post,
    category: r.category ? { id: r.category.id, name: r.category.name, slug: r.category.slug } : null,
    author: r.author ? { id: r.author.id, name: r.author.name, image: r.author.image } : null,
    tags: tagsByPost.get(r.post.id) ?? [],
  }));
}

export async function getFeaturedBlogPosts(limit = 3): Promise<BlogPostWithRelations[]> {
  const all = await getPublishedBlogPosts();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostWithRelations | null> {
  const [row] = await db
    .select({ post: blogPosts, category: blogCategories, author: teamMembers })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .leftJoin(teamMembers, eq(blogPosts.authorId, teamMembers.id))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);

  if (!row) return null;
  const tagsByPost = await attachTags([row.post]);

  return {
    ...row.post,
    category: row.category ? { id: row.category.id, name: row.category.name, slug: row.category.slug } : null,
    author: row.author ? { id: row.author.id, name: row.author.name, image: row.author.image } : null,
    tags: tagsByPost.get(row.post.id) ?? [],
  };
}

export async function getRelatedPosts(post: BlogPostWithRelations, limit = 3) {
  const all = await getPublishedBlogPosts();
  return all
    .filter((p) => p.id !== post.id && p.category?.id === post.category?.id)
    .slice(0, limit);
}

export async function getBlogCategories() {
  return db.select().from(blogCategories).orderBy(asc(blogCategories.name));
}

export async function getBlogTags() {
  return db.select().from(blogTags).orderBy(asc(blogTags.name));
}

// --- Admin (categories & tags) ---

export async function getBlogCategoryByIdAdmin(id: string) {
  const [row] = await db.select().from(blogCategories).where(eq(blogCategories.id, id)).limit(1);
  return row ?? null;
}

export async function getBlogTagByIdAdmin(id: string) {
  const [row] = await db.select().from(blogTags).where(eq(blogTags.id, id)).limit(1);
  return row ?? null;
}

// --- Admin ---

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  return db.select().from(blogPosts).orderBy(desc(blogPosts.updatedAt));
}

export async function getBlogPostByIdAdmin(id: string) {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  if (!row) return null;
  const tagRows = await db
    .select({ tagId: blogPostTags.tagId })
    .from(blogPostTags)
    .where(eq(blogPostTags.postId, id));
  return { post: row, tagIds: tagRows.map((t) => t.tagId) };
}
