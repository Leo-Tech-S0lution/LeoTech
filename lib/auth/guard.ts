import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser } from "./session";
import type { AdminUser } from "@/lib/db/schema";

/** Use at the top of protected admin server components. Redirects to login if unauthenticated. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
