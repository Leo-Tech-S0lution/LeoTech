import { z } from "zod";
import { inquiryStatusSchema } from "./common";

export const updateInquiryStatusSchema = z.object({
  status: inquiryStatusSchema,
});
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
