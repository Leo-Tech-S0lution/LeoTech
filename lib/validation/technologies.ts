import { z } from "zod";
import { orderSchema, requiredString, slugSchema } from "./common";

export const technologyCategorySchema = z.object({
  name: requiredString(100),
  slug: slugSchema.refine((s) => s.length <= 100, "Slug is too long."),
  order: orderSchema,
});
export type TechnologyCategoryInput = z.infer<typeof technologyCategorySchema>;

export const technologySchema = z.object({
  categoryId: z.uuid({ error: "Select a category." }),
  name: requiredString(100),
  // Logo image URL. Empty → null (not undefined) so removing a logo actually clears it on update.
  icon: z.string().trim().max(255).optional().or(z.literal("")).transform((v) => v || null),
  order: orderSchema,
});
export type TechnologyInput = z.infer<typeof technologySchema>;
