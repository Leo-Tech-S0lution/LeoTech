import { z } from "zod";
import { employmentTypeSchema, jobStatusSchema, optionalString, requiredString, slugSchema, stringArraySchema } from "./common";

const dateStringSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date.");

export const jobOpeningSchema = z.object({
  title: requiredString(200),
  slug: slugSchema.refine((s) => s.length <= 200, "Slug is too long."),
  department: optionalString(120),
  location: optionalString(160),
  employmentType: employmentTypeSchema,
  description: optionalString(5000),
  responsibilities: stringArraySchema,
  requirements: stringArraySchema,
  benefits: stringArraySchema,
  applicationInstructions: optionalString(2000),
  deadline: dateStringSchema,
  status: jobStatusSchema,
});
export type JobOpeningInput = z.infer<typeof jobOpeningSchema>;
