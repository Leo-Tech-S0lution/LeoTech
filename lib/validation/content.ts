import { z } from "zod";
import { booleanSchema, optionalString, orderSchema, requiredString } from "./common";

export const homepageSectionSchema = z.object({
  title: optionalString(200),
  description: optionalString(2000),
  enabled: booleanSchema.default(true),
});
export type HomepageSectionInput = z.infer<typeof homepageSectionSchema>;

export const heroSlideSchema = z.object({
  title: requiredString(200),
  subtitle: optionalString(200),
  description: optionalString(2000),
  image: optionalString(500),
  cta1Label: optionalString(60),
  cta1Href: optionalString(255),
  cta2Label: optionalString(60),
  cta2Href: optionalString(255),
  order: orderSchema,
  active: booleanSchema.default(true),
});
export type HeroSlideInput = z.infer<typeof heroSlideSchema>;

export const statisticSchema = z.object({
  label: requiredString(120),
  value: z.coerce.number().int(),
  suffix: optionalString(20),
  order: orderSchema,
});
export type StatisticInput = z.infer<typeof statisticSchema>;

export const whyLeotechItemSchema = z.object({
  title: requiredString(120),
  description: optionalString(2000),
  icon: z.string().trim().min(1).max(60).default("cpu"),
  order: orderSchema,
});
export type WhyLeotechItemInput = z.infer<typeof whyLeotechItemSchema>;

export const processStepSchema = z.object({
  title: requiredString(120),
  description: optionalString(2000),
  icon: z.string().trim().min(1).max(60).default("cpu"),
  order: orderSchema,
});
export type ProcessStepInput = z.infer<typeof processStepSchema>;

export const faqSchema = z.object({
  question: requiredString(255),
  answer: requiredString(4000),
  category: optionalString(100),
  order: orderSchema,
  published: booleanSchema.default(true),
});
export type FaqInput = z.infer<typeof faqSchema>;
