import { z } from "zod";
import { contentStatusSchema, orderSchema, slugSchema, stringArraySchema } from "./common";

export const serviceSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  slug: slugSchema.refine((s) => s.length <= 160, "Slug is too long."),
  shortDescription: z.string().trim().max(300).optional().or(z.literal("")).transform((v) => v || undefined),
  description: z.string().trim().optional().or(z.literal("")).transform((v) => v || undefined),
  icon: z.string().trim().min(1).max(60).default("cpu"),
  features: stringArraySchema,
  technologies: stringArraySchema,
  ctaLabel: z.string().trim().max(60).optional().or(z.literal("")).transform((v) => v || undefined),
  ctaHref: z.string().trim().max(255).optional().or(z.literal("")).transform((v) => v || undefined),
  order: orderSchema,
  featured: z.coerce.boolean<boolean>().default(false),
  status: contentStatusSchema,
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")).transform((v) => v || undefined),
  seoDescription: z.string().trim().max(255).optional().or(z.literal("")).transform((v) => v || undefined),
  ogImage: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => v || undefined),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
