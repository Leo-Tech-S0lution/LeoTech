import "server-only";
import { db } from "@/lib/db";
import {
  contactSubmissions,
  newsletterSubscribers,
  type ContactSubmission,
} from "@/lib/db/schema";
import { and, count, desc, eq } from "drizzle-orm";

export interface ContactSubmissionsPage {
  rows: ContactSubmission[];
  total: number;
  page: number;
  pageSize: number;
}

/** Paginated admin read of contact submissions, newest first, optionally filtered by status. */
export async function getContactSubmissionsAdmin(
  page = 1,
  pageSize = 20,
  status?: ContactSubmission["status"],
): Promise<ContactSubmissionsPage> {
  const where = status ? eq(contactSubmissions.status, status) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(contactSubmissions)
      .where(where)
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ value: count() })
      .from(contactSubmissions)
      .where(where),
  ]);

  return {
    rows,
    total: totalRows[0]?.value ?? 0,
    page,
    pageSize,
  };
}

export async function getContactSubmissionByIdAdmin(id: string): Promise<ContactSubmission | null> {
  const [row] = await db
    .select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id))
    .limit(1);
  return row ?? null;
}

export async function getNewInquiriesCount(): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.status, "new"));
  return row?.value ?? 0;
}

export async function getRecentInquiriesAdmin(limit = 5): Promise<ContactSubmission[]> {
  return db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(limit);
}

export async function getAllNewsletterSubscribersAdmin() {
  return db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.subscribedAt));
}

export async function getNewsletterSubscriberCount(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(newsletterSubscribers);
  return row?.value ?? 0;
}
