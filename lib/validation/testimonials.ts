import { z } from "zod";
import { booleanSchema, optionalString, orderSchema, requiredString } from "./common";

export const testimonialSchema = z.object({
  name: requiredString(160),
  position: optionalString(160),
  company: optionalString(160),
  content: requiredString(4000),
  image: optionalString(500),
  rating: z.coerce.number<number>().int().min(1).max(5).default(5),
  order: orderSchema,
  published: booleanSchema.default(true),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;
