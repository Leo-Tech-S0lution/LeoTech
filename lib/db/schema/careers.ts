import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { employmentTypeEnum, jobStatusEnum } from "./enums";

export const jobOpenings = pgTable("job_openings", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  department: varchar("department", { length: 120 }),
  location: varchar("location", { length: 160 }),
  employmentType: employmentTypeEnum("employment_type")
    .notNull()
    .default("full-time"),
  description: text("description"),
  responsibilities: jsonb("responsibilities").$type<string[]>().default([]),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  benefits: jsonb("benefits").$type<string[]>().default([]),
  applicationInstructions: text("application_instructions"),
  deadline: date("deadline"),
  status: jobStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type JobOpening = typeof jobOpenings.$inferSelect;
export type NewJobOpening = typeof jobOpenings.$inferInsert;
