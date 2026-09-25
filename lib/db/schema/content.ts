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

/**
 * Singleton table (always exactly one row) holding company-wide info:
 * contact details, social links, footer blurb, default SEO, business hours.
 */
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  companyName: varchar("company_name", { length: 160 })
    .notNull()
    .default("Leo Tech Solution"),
  tagline: varchar("tagline", { length: 255 }),
  footerDescription: text("footer_description"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  businessHours: varchar("business_hours", { length: 255 }),
  schedulingUrl: text("scheduling_url"),
  socialLinks: jsonb("social_links")
    .$type<{ label: string; url: string }[]>()
    .default([]),
  defaultSeoTitle: varchar("default_seo_title", { length: 160 }),
  defaultSeoDescription: varchar("default_seo_description", { length: 255 }),
  defaultOgImage: text("default_og_image"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Per-section homepage controls: enable/disable, title/description override, order. */
export const homepageSections = pgTable("homepage_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionKey: varchar("section_key", { length: 60 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(true),
  order: integer("order").notNull().default(0),
});

export const heroSlides = pgTable("hero_slides", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  subtitle: varchar("subtitle", { length: 200 }),
  description: text("description"),
  image: text("image"),
  cta1Label: varchar("cta1_label", { length: 60 }),
  cta1Href: varchar("cta1_href", { length: 255 }),
  cta2Label: varchar("cta2_label", { length: 60 }),
  cta2Href: varchar("cta2_href", { length: 255 }),
  order: integer("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const statistics = pgTable("statistics", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: varchar("label", { length: 120 }).notNull(),
  value: integer("value").notNull(),
  suffix: varchar("suffix", { length: 20 }),
  order: integer("order").notNull().default(0),
});

export const processSteps = pgTable("process_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 60 }),
  order: integer("order").notNull().default(0),
});

export const whyLeotechItems = pgTable("why_leotech_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 60 }),
  order: integer("order").notNull().default(0),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: varchar("question", { length: 255 }).notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

/** SEO overrides for static routes that aren't backed by their own entity (home, about, contact...). */
export const seoPages = pgTable("seo_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  path: varchar("path", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 160 }),
  description: varchar("description", { length: 255 }),
  ogImage: text("og_image"),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type HomepageSection = typeof homepageSections.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type NewHeroSlide = typeof heroSlides.$inferInsert;
export type Statistic = typeof statistics.$inferSelect;
export type ProcessStep = typeof processSteps.$inferSelect;
export type WhyLeotechItem = typeof whyLeotechItems.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type SeoPage = typeof seoPages.$inferSelect;
