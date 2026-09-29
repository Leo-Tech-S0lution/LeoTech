"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminButton } from "@/components/admin/ui/button";
import { Input, Select } from "@/components/admin/ui/input";
import { deleteBlogPostAction } from "./actions";
import { formatDate } from "@/lib/utils/text";
import type { BlogPost } from "@/lib/db/schema";

export function PostsTable({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = posts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || p.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<BlogPost>[] = [
    {
      header: "Post",
      cell: (row) => (
        <div>
          <p className="max-w-sm truncate font-medium text-heading">
            {row.title}
            {row.featured ? <Star className="ml-1.5 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : null}
          </p>
          <p className="text-xs text-slate-400">/{row.slug}</p>
        </div>
      ),
    },
    { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Published",
      cell: (row) => (row.publishedAt ? formatDate(row.publishedAt) : "—"),
    },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/blog/posts/${row.id}`} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <DeleteButton
            itemLabel={row.title}
            action={() => deleteBlogPostAction(row.id)}
            onDeleted={() => router.refresh()}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input placeholder="Search posts…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No blog posts found." />
    </div>
  );
}
