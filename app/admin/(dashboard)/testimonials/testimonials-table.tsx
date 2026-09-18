"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { BooleanBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { deleteTestimonialAction } from "./actions";
import type { Testimonial } from "@/lib/db/schema";

export function TestimonialsTable({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.company ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const columns: Column<Testimonial>[] = [
    {
      header: "Testimonial",
      cell: (row) => (
        <div>
          <p className="font-medium text-navy-900">{row.name}</p>
          <p className="text-xs text-slate-400">{[row.position, row.company].filter(Boolean).join(" · ")}</p>
        </div>
      ),
    },
    {
      header: "Rating",
      cell: (row) => (
        <div className="flex gap-0.5">
          {Array.from({ length: row.rating ?? 0 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
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
          <AdminButton variant="ghost" size="icon" href={`/admin/testimonials/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel={row.name}
            action={() => deleteTestimonialAction(row.id)}
            onDeleted={() => router.refresh()}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Search testimonials…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No testimonials found." />
    </div>
  );
}
