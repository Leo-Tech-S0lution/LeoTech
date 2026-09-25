import { z } from "zod";
import {
  contentStatusSchema,
  courseLevelSchema,
  orderSchema,
  slugSchema,
  stringArraySchema,
} from "./common";

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));

/** Optional decimal price string, e.g. "1200" or "1200.00". Stored/submitted as a plain string. */
const priceSchema = z
  .string()
  .trim()
  .max(20)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid price, e.g. 1200 or 1200.00.");

/** Optional date string in YYYY-MM-DD format. */
const dateStringSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date.");

const curriculumModuleSchema = z.object({
  title: z.string().trim().min(1, "Module title is required."),
  items: z.array(z.string().trim().min(1)),
});

export const curriculumSchema = z.array(curriculumModuleSchema).default([]);

export const trainingCourseSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  slug: slugSchema.refine((s) => s.length <= 160, "Slug is too long."),
  category: optionalTrimmed(100),
  description: optionalTrimmed(5000),
  duration: optionalTrimmed(60),
  level: courseLevelSchema.default("beginner"),
  technologies: stringArraySchema,
  curriculum: curriculumSchema,
  projects: stringArraySchema,
  certification: optionalTrimmed(2000),
  price: priceSchema,
  instructor: optionalTrimmed(160),
  startDate: dateStringSchema,
  image: optionalTrimmed(500),
  featured: z.coerce.boolean<boolean>().default(false),
  status: contentStatusSchema,
  order: orderSchema,
  seoTitle: optionalTrimmed(160),
  seoDescription: optionalTrimmed(255),
  ogImage: optionalTrimmed(500),
});
export type TrainingCourseInput = z.infer<typeof trainingCourseSchema>;

export const internshipProgramSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: optionalTrimmed(5000),
  duration: optionalTrimmed(60),
  technologies: stringArraySchema,
  projects: optionalTrimmed(4000),
  mentorship: optionalTrimmed(2000),
  certificate: optionalTrimmed(2000),
  eligibility: optionalTrimmed(2000),
  status: contentStatusSchema,
  order: orderSchema,
});
export type InternshipProgramInput = z.infer<typeof internshipProgramSchema>;
