import { z } from "zod";
import { labelUrlPairArraySchema, optionalString, requiredString } from "./common";

export const siteSettingsSchema = z.object({
  companyName: requiredString(160),
  tagline: optionalString(255),
  footerDescription: optionalString(1000),
  email: optionalString(255),
  phone: optionalString(40),
  address: optionalString(500),
  businessHours: optionalString(255),
  schedulingUrl: optionalString(500),
  socialLinks: labelUrlPairArraySchema,
  defaultSeoTitle: optionalString(160),
  defaultSeoDescription: optionalString(255),
  defaultOgImage: optionalString(500),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
