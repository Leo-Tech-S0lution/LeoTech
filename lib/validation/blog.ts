import { z } from "zod";
import { contentStatusSchema, optionalString, requiredString, slugSchema } from "./common";

const uuidOrEmpty = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

export const blogPostSchema = z.object({
  title: requiredString(220),
  slug: slugSchema.refine((s) => s.length <= 200, "Slug is too long."),
  excerpt: optionalString(320),
  content: z.string().default(""),
  featuredImage: optionalString(500),
  categoryId: uuidOrEmpty,
  authorId: uuidOrEmpty,
  tagIds: z.array(z.string()).default([]),
  featured: z.coerce.boolean<boolean>().default(false),
  status: contentStatusSchema,
  seoTitle: optionalString(160),
  seoDescription: optionalString(255),
  ogImage: optionalString(500),
  publishedAt: optionalString(40),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const blogCategorySchema = z.object({
  name: requiredString(120),
  slug: slugSchema.refine((s) => s.length <= 120, "Slug is too long."),
});
export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;

export const blogTagSchema = z.object({
  name: requiredString(80),
  slug: slugSchema.refine((s) => s.length <= 80, "Slug is too long."),
});
export type BlogTagInput = z.infer<typeof blogTagSchema>;
