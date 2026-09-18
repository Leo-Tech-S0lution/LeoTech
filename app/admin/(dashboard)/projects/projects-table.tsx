"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { Input, Select } from "@/components/admin/ui/input";
import { deleteProjectAction } from "./actions";
import type { Project } from "@/lib/db/schema";

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = projects.filter((p) => {
    const query = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query) ||
      (p.client ?? "").toLowerCase().includes(query);
    const matchesStatus = status === "all" || p.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Project>[] = [
    {
      header: "Project",
      cell: (row) => (
        <div>
          <p className="font-medium text-navy-900">{row.title}</p>
          <p className="text-xs text-slate-400">
            /{row.slug}
            {row.client ? ` · ${row.client}` : ""}
          </p>
        </div>
      ),
    },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Featured",
      className: "w-20",
      cell: (row) =>
        row.featured ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : null,
    },
    { header: "Order", cell: (row) => row.order, className: "w-16" },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/projects/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel={row.title}
            action={() => deleteProjectAction(row.id)}
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
          placeholder="Search projects…"
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
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No projects found." />
    </div>
  );
}
