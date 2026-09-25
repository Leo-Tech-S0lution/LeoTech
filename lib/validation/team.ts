import { z } from "zod";
import {
  booleanSchema,
  employmentTypeSchema,
  labelUrlPairArraySchema,
  optionalString,
  orderSchema,
  requiredString,
  slugSchema,
  stringArraySchema,
} from "./common";

const optionalUrl = optionalString(500).refine((v) => !v || /^https?:\/\//i.test(v), {
  error: "Links must start with http:// or https://",
});

const experienceSchema = z.object({
  role: requiredString(160),
  organization: requiredString(160),
  period: optionalString(80),
  description: optionalString(1000),
});

const educationSchema = z.object({
  degree: requiredString(160),
  institution: requiredString(160),
  period: optionalString(80),
  description: optionalString(1000),
});

const projectSchema = z.object({
  name: requiredString(160),
  description: optionalString(1000),
  url: optionalUrl,
});

const certificationSchema = z.object({
  name: requiredString(160),
  issuer: optionalString(160),
  year: optionalString(20),
  url: optionalUrl,
});

/** Array of structured rows (experience, education, …). */
function listOf<T extends z.ZodType>(item: T) {
  return z.array(item).default([]);
}

/** True if every string field in a repeatable row is blank (an "Add" click the admin never filled in). */
export function isBlankRow(row: Record<string, unknown>): boolean {
  return !Object.values(row).some((v) => typeof v === "string" && v.trim() !== "");
}

export const teamMemberSchema = z.object({
  // Step 1 — basic information
  firstName: optionalString(60),
  middleName: optionalString(60),
  lastName: optionalString(60),
  name: requiredString(160),
  image: optionalString(500),
  coverImage: optionalString(500),
  // Step 2 — professional information
  employeeId: optionalString(40).transform((v) => v?.toUpperCase()),
  position: optionalString(160),
  department: optionalString(120),
  joiningDate: optionalString(10).refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    error: "Joining date must be a valid date.",
  }),
  employmentType: employmentTypeSchema.optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  // Step 3 — contact
  email: optionalString(255).refine((v) => !v || z.email().safeParse(v).success, {
    error: "Enter a valid email address.",
  }),
  phone: optionalString(40),
  whatsapp: optionalString(40),
  location: optionalString(160),
  // Step 4 — professional profile
  bio: optionalString(4000),
  biography: optionalString(8000),
  skills: stringArraySchema,
  experience: listOf(experienceSchema),
  education: listOf(educationSchema),
  projects: listOf(projectSchema),
  certifications: listOf(certificationSchema),
  // Step 5 — social links
  socialLinks: labelUrlPairArraySchema,
  // Step 6 — profile settings
  slug: slugSchema.optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  order: orderSchema,
  published: booleanSchema.default(true),
  isActive: booleanSchema.default(true),
  isVerified: booleanSchema.default(false),
  // Step 7 — QR
  qrEnabled: booleanSchema.default(true),
});
/** Parsed (output) values — what server actions receive. */
export type TeamMemberInput = z.output<typeof teamMemberSchema>;
/** Raw form (input) values — what react-hook-form holds. */
export type TeamMemberFormValues = z.input<typeof teamMemberSchema>;
