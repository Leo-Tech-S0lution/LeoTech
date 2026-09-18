"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { BooleanBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { deleteFaqAction } from "./actions";
import type { Faq } from "@/lib/db/schema";

export function FaqsTable({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = faqs.filter((f) => f.question.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Faq>[] = [
    {
      header: "Question",
      cell: (row) => (
        <div>
          <p className="max-w-md font-medium text-navy-900">{row.question}</p>
          {row.category ? <p className="text-xs text-slate-400">{row.category}</p> : null}
        </div>
      ),
    },
    { header: "Order", cell: (row) => row.order, className: "w-16" },
    {
      header: "Published",
      cell: (row) => <BooleanBadge value={row.published} trueLabel="Published" falseLabel="Hidden" />,
    },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/website/faq/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel={row.question}
            action={() => deleteFaqAction(row.id)}
            onDeleted={() => router.refresh()}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Input placeholder="Search FAQs…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No FAQs found." />
    </div>
  );
}
