import { pgTable, uuid, integer, varchar } from "drizzle-orm/pg-core";

export const technologyCategories = pgTable("technology_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  order: integer("order").notNull().default(0),
});

export const technologies = pgTable("technologies", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => technologyCategories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 255 }), // icon key or media URL
  order: integer("order").notNull().default(0),
});

export type TechnologyCategory = typeof technologyCategories.$inferSelect;
export type Technology = typeof technologies.$inferSelect;
