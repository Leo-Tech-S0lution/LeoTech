import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guard";
import { getContactSubmissionsAdmin } from "@/lib/db/queries/contact";
import { PageHeader } from "@/components/admin/page-header";
import { InquiriesList } from "./inquiries-list";
import { AdminButton } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils/cn";
import type { ContactSubmission } from "@/lib/db/schema";

interface MessagesPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

const STATUS_TABS: { label: string; value?: ContactSubmission["status"] }[] = [
  { label: "All" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Closed", value: "closed" },
];

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  await requireAdmin();
  const { page: pageParam, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = 20;

  const { rows, total } = await getContactSubmissionsAdmin(
    page,
    pageSize,
    status as ContactSubmission["status"] | undefined,
  );
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader title="Messages / Inquiries" description="Contact form submissions from the public site." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/messages?status=${tab.value}` : "/admin/messages"}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium",
              status === tab.value || (!status && !tab.value)
                ? "bg-navy-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <InquiriesList inquiries={rows} />

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 ? (
            <AdminButton
              variant="outline"
              size="sm"
              href={`/admin/messages?page=${page - 1}${status ? `&status=${status}` : ""}`}
            >
              Previous
            </AdminButton>
          ) : null}
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <AdminButton
              variant="outline"
              size="sm"
              href={`/admin/messages?page=${page + 1}${status ? `&status=${status}` : ""}`}
            >
              Next
            </AdminButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
