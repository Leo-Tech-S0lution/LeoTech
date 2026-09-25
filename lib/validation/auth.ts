import { z } from "zod";
import { adminRoleSchema, emailSchema } from "./common";

export const loginSchema = z.object({
  email: emailSchema(255),
  password: z.string().min(1, "Password is required."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: emailSchema(255),
  role: adminRoleSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;

export const updateAdminUserSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: emailSchema(255),
  role: adminRoleSchema,
});
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;

export const resetPasswordSchema = z.object({
  id: z.uuid(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
