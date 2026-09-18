"use client";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { deleteInternshipAction } from "./actions";
import type { InternshipProgram } from "@/lib/db/schema";

export function InternshipsTable({ programs }: { programs: InternshipProgram[] }) {
  const router = useRouter();

  const columns: Column<InternshipProgram>[] = [
    { header: "Program", cell: (row) => <p className="font-medium text-navy-900">{row.title}</p> },
    { header: "Duration", cell: (row) => row.duration ?? "—" },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { header: "Order", cell: (row) => row.order, className: "w-16" },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/training/internships/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel={row.title}
            action={() => deleteInternshipAction(row.id)}
            onDeleted={() => router.refresh()}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} rows={programs} rowKey={(r) => r.id} emptyMessage="No internship programs found." />
  );
}
