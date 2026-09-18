"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { DataTable, type Column } from "@/components/admin/data-table";
import { BooleanBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { deleteTeamMemberAction } from "./actions";
import type { TeamMember } from "@/lib/db/schema";

export function TeamTable({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<TeamMember>[] = [
    {
      header: "Member",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100">
            {row.image ? (
              <Image src={row.image} alt="" fill className="object-cover" sizes="36px" />
            ) : null}
          </div>
          <div>
            <p className="font-medium text-navy-900">{row.name}</p>
            <p className="text-xs text-slate-400">{row.position}</p>
          </div>
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
          <AdminButton variant="ghost" size="icon" href={`/admin/team/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel={row.name}
            action={() => deleteTeamMemberAction(row.id)}
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
          placeholder="Search team members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No team members found." />
    </div>
  );
}
