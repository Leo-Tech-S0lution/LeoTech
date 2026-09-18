"use client";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { BooleanBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { deleteHeroSlideAction } from "./actions";
import type { HeroSlide } from "@/lib/db/schema";

export function HeroSlidesTable({ slides }: { slides: HeroSlide[] }) {
  const router = useRouter();

  const columns: Column<HeroSlide>[] = [
    {
      header: "Slide",
      cell: (row) => (
        <div>
          <p className="max-w-sm truncate font-medium text-navy-900">{row.title.split("\n")[0]}</p>
          {row.subtitle ? <p className="text-xs text-slate-400">{row.subtitle}</p> : null}
        </div>
      ),
    },
    { header: "Order", cell: (row) => row.order, className: "w-16" },
    {
      header: "Active",
      cell: (row) => <BooleanBadge value={row.active} trueLabel="Active" falseLabel="Hidden" />,
    },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/website/hero/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel="Hero slide"
            action={() => deleteHeroSlideAction(row.id)}
            onDeleted={() => router.refresh()}
          />
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} rows={slides} rowKey={(r) => r.id} emptyMessage="No hero slides found." />;
}
