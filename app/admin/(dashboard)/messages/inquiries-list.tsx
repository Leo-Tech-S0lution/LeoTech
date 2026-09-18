"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Building2 } from "lucide-react";
import { Select } from "@/components/admin/ui/input";
import { updateInquiryStatusAction } from "./actions";
import { toast } from "@/components/admin/toast";
import { formatDate } from "@/lib/utils/text";
import { EmptyState } from "@/components/ui/empty-state";
import type { ContactSubmission } from "@/lib/db/schema";

export function InquiriesList({ inquiries }: { inquiries: ContactSubmission[] }) {
  if (inquiries.length === 0) {
    return <EmptyState message="No inquiries yet." className="rounded-xl border-slate-200" />;
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inquiry) => (
        <InquiryCard key={inquiry.id} inquiry={inquiry} />
      ))}
    </div>
  );
}

function InquiryCard({ inquiry }: { inquiry: ContactSubmission }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateInquiryStatusAction(inquiry.id, { status });
      if (result.success) {
        toast.success("Status updated.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-navy-900">{inquiry.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {inquiry.email}
            </span>
            {inquiry.phone ? (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {inquiry.phone}
              </span>
            ) : null}
            {inquiry.company ? (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> {inquiry.company}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{formatDate(inquiry.createdAt)}</span>
          <Select
            value={inquiry.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className="w-32"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
      </div>

      {(inquiry.service || inquiry.budget) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {inquiry.service ? (
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-700">{inquiry.service}</span>
          ) : null}
          {inquiry.budget ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">{inquiry.budget}</span>
          ) : null}
        </div>
      )}

      <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{inquiry.message}</p>
    </div>
  );
}
