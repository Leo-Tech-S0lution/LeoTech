import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { contentStatusEnum } from "./enums";
import { adminUsers } from "./auth";
import { teamMembers } from "./team";

export const blogCategories = pgTable("blog_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
});

export const blogTags = pgTable("blog_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 220 }).notNull(),
  excerpt: varchar("excerpt", { length: 320 }),
  content: text("content").notNull().default(""),
  featuredImage: text("featured_image"),
  categoryId: uuid("category_id").references(() => blogCategories.id, {
    onDelete: "set null",
  }),
  authorId: uuid("author_id").references(() => teamMembers.id, {
    onDelete: "set null",
  }),
  createdByAdminId: uuid("created_by_admin_id").references(
    () => adminUsers.id,
    { onDelete: "set null" },
  ),
  readingTimeMinutes: integer("reading_time_minutes"),
  featured: boolean("featured").notNull().default(false),
  status: contentStatusEnum("status").notNull().default("draft"),
  seoTitle: varchar("seo_title", { length: 160 }),
  seoDescription: varchar("seo_description", { length: 255 }),
  ogImage: text("og_image"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blogPostTags = pgTable(
  "blog_post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => blogTags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] })],
);

export type BlogCategory = typeof blogCategories.$inferSelect;
export type BlogTag = typeof blogTags.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
