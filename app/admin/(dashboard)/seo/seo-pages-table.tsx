"use client";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { deleteSeoPageAction } from "./actions";
import type { SeoPage } from "@/lib/db/schema";

export function SeoPagesTable({ pages }: { pages: SeoPage[] }) {
  const router = useRouter();

  const columns: Column<SeoPage>[] = [
    { header: "Path", cell: (row) => <span className="font-mono text-xs text-heading">{row.path}</span> },
    { header: "Title", cell: (row) => row.title ?? "—" },
    { header: "Description", cell: (row) => <span className="line-clamp-1 max-w-xs text-slate-500">{row.description ?? "—"}</span> },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/seo/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton itemLabel={row.path} action={() => deleteSeoPageAction(row.id)} onDeleted={() => router.refresh()} />
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} rows={pages} rowKey={(r) => r.id} emptyMessage="No SEO overrides yet." />;
}
