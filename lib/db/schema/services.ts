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

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  shortDescription: varchar("short_description", { length: 300 }),
  description: text("description"),
  icon: varchar("icon", { length: 60 }).notNull().default("cpu"),
  features: jsonb("features").$type<string[]>().default([]),
  technologies: jsonb("technologies").$type<string[]>().default([]),
  ctaLabel: varchar("cta_label", { length: 60 }),
  ctaHref: varchar("cta_href", { length: 255 }),
  order: integer("order").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  status: contentStatusEnum("status").notNull().default("draft"),
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

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
