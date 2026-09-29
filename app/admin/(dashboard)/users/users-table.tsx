"use client";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { deleteAdminUserAction } from "./actions";
import type { AdminUser } from "@/lib/db/schema";

export function UsersTable({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const router = useRouter();

  const columns: Column<AdminUser>[] = [
    {
      header: "User",
      cell: (row) => (
        <div>
          <p className="font-medium text-heading">
            {row.name}
            {row.id === currentUserId ? <span className="ml-1.5 text-xs text-slate-400">(you)</span> : null}
          </p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (row) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
          {row.role}
        </span>
      ),
    },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/users/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel={row.name}
            action={() => deleteAdminUserAction(row.id)}
            onDeleted={() => router.refresh()}
          />
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} rows={users} rowKey={(r) => r.id} emptyMessage="No admin users found." />;
}
