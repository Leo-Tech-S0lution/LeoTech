import { pgEnum } from "drizzle-orm/pg-core";

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "published",
  "archived",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "contacted",
  "closed",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "open",
  "closed",
  "draft",
]);

export const adminRoleEnum = pgEnum("admin_role", ["owner", "editor"]);

export const employmentTypeEnum = pgEnum("employment_type", [
  "full-time",
  "part-time",
  "contract",
  "internship",
]);

export const courseLevelEnum = pgEnum("course_level", [
  "beginner",
  "intermediate",
  "advanced",
]);
