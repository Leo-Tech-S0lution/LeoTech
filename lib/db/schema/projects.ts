import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { contentStatusEnum } from "./enums";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  client: varchar("client", { length: 160 }),
  category: varchar("category", { length: 100 }),
  summary: varchar("summary", { length: 300 }),
  challenge: text("challenge"),
  solution: text("solution"),
  results: text("results"),
  technologies: jsonb("technologies").$type<string[]>().default([]),
  coverImage: text("cover_image"),
  gallery: jsonb("gallery").$type<string[]>().default([]),
  projectUrl: text("project_url"),
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

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
