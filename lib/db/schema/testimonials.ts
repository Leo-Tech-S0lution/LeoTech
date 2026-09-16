import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  boolean,
  smallint,
} from "drizzle-orm/pg-core";

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  position: varchar("position", { length: 160 }),
  company: varchar("company", { length: 160 }),
  content: text("content").notNull(),
  image: text("image"),
  rating: smallint("rating").default(5),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
