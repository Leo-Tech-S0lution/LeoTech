import { z } from "zod";
import {
  contentStatusSchema,
  hrefSchema,
  optionalString,
  orderSchema,
  slugSchema,
  stringArraySchema,
} from "./common";

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  slug: slugSchema.refine((s) => s.length <= 160, "Slug is too long."),
  client: optionalString(160),
  category: optionalString(100),
  summary: optionalString(300),
  challenge: optionalString(5000),
  solution: optionalString(5000),
  results: optionalString(5000),
  technologies: stringArraySchema,
  coverImage: optionalString(500),
  gallery: z.array(z.string().trim().min(1)).default([]),
  projectUrl: hrefSchema,
  featured: z.coerce.boolean().default(false),
  status: contentStatusSchema,
  order: orderSchema,
  seoTitle: optionalString(160),
  seoDescription: optionalString(255),
  ogImage: optionalString(500),
});
export type ProjectInput = z.infer<typeof projectSchema>;
