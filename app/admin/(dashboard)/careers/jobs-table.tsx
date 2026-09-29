"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { Input, Select } from "@/components/admin/ui/input";
import { deleteJobOpeningAction } from "./actions";
import type { JobOpening } from "@/lib/db/schema";

export function JobsTable({ jobs }: { jobs: JobOpening[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = jobs.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || j.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<JobOpening>[] = [
    {
      header: "Role",
      cell: (row) => (
        <div>
          <p className="font-medium text-heading">{row.title}</p>
          <p className="text-xs text-slate-400">{[row.department, row.location].filter(Boolean).join(" · ")}</p>
        </div>
      ),
    },
    { header: "Type", cell: (row) => <span className="capitalize">{row.employmentType}</span> },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/careers/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel={row.title}
            action={() => deleteJobOpeningAction(row.id)}
            onDeleted={() => router.refresh()}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input placeholder="Search openings…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </Select>
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No job openings found." />
    </div>
  );
}
