import type { AdminUser } from "@/lib/db/schema";

/**
 * Role map for the team/QR module, on top of the existing owner/editor roles:
 * - owner  → full access (QR settings, regenerate, verification, activation, slug changes, delete)
 * - editor → edit profile content, view/preview/download/print QR, view analytics
 */
export type TeamPermission =
  | "team.edit"
  | "team.manage" // verification, activation, visibility, slug, QR enable
  | "team.delete"
  | "qr.view"
  | "qr.manage" // generate / regenerate
  | "analytics.view";

const ROLE_PERMISSIONS: Record<AdminUser["role"], TeamPermission[]> = {
  owner: ["team.edit", "team.manage", "team.delete", "qr.view", "qr.manage", "analytics.view"],
  editor: ["team.edit", "qr.view", "analytics.view"],
};

export function can(user: Pick<AdminUser, "role">, permission: TeamPermission): boolean {
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}
