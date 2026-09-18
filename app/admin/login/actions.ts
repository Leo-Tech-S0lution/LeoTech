"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getAdminUserByEmail } from "@/lib/db/queries/users";
import { loginSchema } from "@/lib/validation/auth";
import type { ActionResult } from "@/lib/validation/common";

// A precomputed bcrypt hash with no matching plaintext. Compared against when the email
// isn't found so a nonexistent-user response takes comparable time to a wrong-password one —
// this keeps response timing from leaking whether an account exists.
const DUMMY_HASH = "$2a$12$hOmuYpzVQf6HCNsLB95/aOTVPBbTKmUsK.laGiWKJVDJ9V6Z0Mq5O";

const GENERIC_ERROR = "Invalid email or password.";

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: GENERIC_ERROR };
  }

  const { email, password } = parsed.data;
  const user = await getAdminUserByEmail(email);

  const passwordOk = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    return { success: false, error: GENERIC_ERROR };
  }

  await createSession(user.id);
  redirect("/admin");
}
