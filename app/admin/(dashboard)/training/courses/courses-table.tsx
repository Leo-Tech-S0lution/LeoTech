"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { Input, Select } from "@/components/admin/ui/input";
import { deleteCourseAction } from "./actions";
import type { TrainingCourse } from "@/lib/db/schema";

export function CoursesTable({ courses }: { courses: TrainingCourse[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase());
    const matchesStatus = status === "all" || c.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<TrainingCourse>[] = [
    {
      header: "Course",
      cell: (row) => (
        <div>
          <p className="font-medium text-navy-900">
            {row.title}
            {row.featured ? <Star className="ml-1.5 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : null}
          </p>
          <p className="text-xs text-slate-400">/{row.slug}</p>
        </div>
      ),
    },
    { header: "Level", cell: (row) => <span className="capitalize">{row.level}</span> },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { header: "Order", cell: (row) => row.order, className: "w-16" },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/training/courses/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel={row.title}
            action={() => deleteCourseAction(row.id)}
            onDeleted={() => router.refresh()}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No courses found." />
    </div>
  );
}
