import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  boolean,
  timestamp,
  jsonb,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { contentStatusEnum, courseLevelEnum } from "./enums";

export const trainingCourses = pgTable("training_courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  duration: varchar("duration", { length: 60 }),
  level: courseLevelEnum("level").notNull().default("beginner"),
  technologies: jsonb("technologies").$type<string[]>().default([]),
  curriculum: jsonb("curriculum")
    .$type<{ title: string; items: string[] }[]>()
    .default([]),
  projects: jsonb("projects").$type<string[]>().default([]),
  certification: text("certification"),
  price: numeric("price", { precision: 10, scale: 2 }),
  instructor: varchar("instructor", { length: 160 }),
  startDate: date("start_date"),
  image: text("image"),
  featured: boolean("featured").notNull().default(false),
  status: contentStatusEnum("status").notNull().default("draft"),
  order: integer("order").notNull().default(0),
  seoTitle: varchar("seo_title", { length: 160 }),
  seoDescription: varchar("seo_description", { length: 255 }),
  ogImage: text("og_image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const internshipPrograms = pgTable("internship_programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  duration: varchar("duration", { length: 60 }),
  technologies: jsonb("technologies").$type<string[]>().default([]),
  projects: text("projects"),
  mentorship: text("mentorship"),
  certificate: text("certificate"),
  eligibility: text("eligibility"),
  status: contentStatusEnum("status").notNull().default("draft"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type TrainingCourse = typeof trainingCourses.$inferSelect;
export type NewTrainingCourse = typeof trainingCourses.$inferInsert;
export type InternshipProgram = typeof internshipPrograms.$inferSelect;
export type NewInternshipProgram = typeof internshipPrograms.$inferInsert;
