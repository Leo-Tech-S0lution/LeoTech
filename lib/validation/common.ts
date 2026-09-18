import { z } from "zod";

/** Non-empty trimmed string, required. */
export const requiredString = (max = 255) =>
  z.string().trim().min(1, "This field is required.").max(max);

/** Optional trimmed string -> undefined when empty. */
export const optionalString = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));

/** Slug: lowercase letters, numbers, hyphens only. */
export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only.");

/** Path for SEO pages: must start with "/". */
export const pathSchema = z
  .string()
  .trim()
  .min(1, "Path is required.")
  .max(255)
  .regex(/^\/[a-zA-Z0-9\-_/]*$/, "Path must start with / and contain only valid URL characters.");

/** A URL or a relative path (hrefs, cta links, project urls). */
export const hrefSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

/** Coerces a checkbox/select-driven boolean field. */
export const booleanSchema = z.coerce.boolean();

/** Coerces an order/number input, defaulting to 0. */
export const orderSchema = z.coerce.number().int().default(0);

/** String array field (features, technologies, skills, etc.) - filters blank entries. */
export const stringArraySchema = z
  .array(z.string().trim().min(1))
  .default([])
  .or(
    z
      .string()
      .transform((s) =>
        s
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      ),
  );

/** {label, url} repeatable pair schema, used for social links and similar. */
export const labelUrlPairSchema = z.object({
  label: z.string().trim().min(1, "Label is required."),
  url: z.string().trim().min(1, "URL is required."),
});
export const labelUrlPairArraySchema = z.array(labelUrlPairSchema).default([]);

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);
export const jobStatusSchema = z.enum(["open", "closed", "draft"]);
export const inquiryStatusSchema = z.enum(["new", "contacted", "closed"]);
export const adminRoleSchema = z.enum(["owner", "editor"]);
export const employmentTypeSchema = z.enum(["full-time", "part-time", "contract", "internship"]);
export const courseLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Postgres unique_violation error code. */
export const PG_UNIQUE_VIOLATION = "23505";

export function isPgError(err: unknown): err is { code: string; constraint?: string } {
  return typeof err === "object" && err !== null && "code" in err;
}

/** Maps a caught error to a friendly ActionResult, special-casing unique constraint violations. */
export function toActionError(err: unknown, friendlyFieldName = "value"): { success: false; error: string } {
  if (isPgError(err) && err.code === PG_UNIQUE_VIOLATION) {
    return { success: false, error: `That ${friendlyFieldName} is already in use. Please choose another.` };
  }
  console.error(err);
  return { success: false, error: "Something went wrong. Please try again." };
}
