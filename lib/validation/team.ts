import { z } from "zod";
import {
  booleanSchema,
  labelUrlPairArraySchema,
  optionalString,
  orderSchema,
  requiredString,
  stringArraySchema,
} from "./common";

export const teamMemberSchema = z.object({
  name: requiredString(160),
  position: optionalString(160),
  bio: optionalString(4000),
  image: optionalString(500),
  skills: stringArraySchema,
  socialLinks: labelUrlPairArraySchema,
  order: orderSchema,
  published: booleanSchema.default(true),
});
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
