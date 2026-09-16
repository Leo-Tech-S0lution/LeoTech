import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { inquiryStatusEnum } from "./enums";

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  company: varchar("company", { length: 160 }),
  service: varchar("service", { length: 160 }),
  budget: varchar("budget", { length: 80 }),
  message: text("message").notNull(),
  status: inquiryStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
