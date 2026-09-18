import { z } from "zod";
import { optionalString, pathSchema } from "./common";

export const seoPageSchema = z.object({
  path: pathSchema,
  title: optionalString(160),
  description: optionalString(255),
  ogImage: optionalString(500),
});
export type SeoPageInput = z.infer<typeof seoPageSchema>;
