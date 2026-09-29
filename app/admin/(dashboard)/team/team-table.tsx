"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Pencil,
  ExternalLink,
  QrCode,
  BarChart3,
  Power,
  BadgeCheck,
  Trash2,
  Copy,
} from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminButton } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ActionsMenu } from "@/components/admin/actions-menu";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import {
  CompletionMeter,
  ProfileStatusBadges,
  QrStatusBadge,
  VerifiedBadge,
} from "@/components/admin/team/badges";
import { QrPreviewDialog, type QrPreviewMember } from "@/components/admin/team/qr-preview-dialog";
import { copyProfileUrl } from "@/components/admin/team/qr-client";
import {
  deleteTeamMemberAction,
  setTeamMemberActiveAction,
  setTeamMemberVerifiedAction,
} from "./actions";
import type { QrStatus } from "@/lib/team/profile";

export interface TeamRow {
  id: string;
  name: string;
  position: string | null;
  department: string | null;
  employeeId: string | null;
  image: string | null;
  order: number;
  published: boolean;
  isActive: boolean;
  isVerified: boolean;
  qrVersion: number;
  qrStatus: QrStatus;
  profilePath: string;
  profileUrl: string;
  completion: number;
}

interface TeamTableProps {
  rows: TeamRow[];
  canManage: boolean;
  canDelete: boolean;
}

export function TeamTable({ rows, canManage, canDelete }: TeamTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<QrPreviewMember | null>(null);
  const [toDelete, setToDelete] = useState<TeamRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const q = search.trim().toLowerCase();
  const filtered = rows.filter((m) =>
    [m.name, m.position, m.department, m.employeeId].some((v) => v?.toLowerCase().includes(q)),
  );

  function run(action: () => Promise<{ success: boolean; error?: string }>, message: string) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(message);
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  const columns: Column<TeamRow>[] = [
    {
      header: "Member",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100">
            {row.image ? <Image src={row.image} alt="" fill className="object-cover" sizes="36px" /> : null}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-heading">{row.name}</p>
            <p className="text-xs text-slate-400">{row.position}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Department / ID",
      cell: (row) => (
        <div>
          <p className="text-sm">{row.department ?? <span className="text-slate-300">—</span>}</p>
          <p className="font-mono text-xs text-slate-400">{row.employeeId ?? "No ID"}</p>
        </div>
      ),
    },
    {
      header: "Profile URL",
      cell: (row) => (
        <button
          type="button"
          onClick={() => copyProfileUrl(row.profileUrl)}
          className="group inline-flex max-w-[200px] items-center gap-1.5 font-mono text-xs text-slate-500 hover:text-blue-600"
          title="Copy profile URL"
        >
          <span className="truncate">{row.profilePath}</span>
          <Copy className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100" />
        </button>
      ),
    },
    { header: "QR", cell: (row) => <QrStatusBadge status={row.qrStatus} /> },
    { header: "Status", cell: (row) => <ProfileStatusBadges isActive={row.isActive} published={row.published} /> },
    { header: "Verification", cell: (row) => <VerifiedBadge verified={row.isVerified} /> },
    { header: "Complete", cell: (row) => <CompletionMeter percent={row.completion} /> },
    {
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AdminButton variant="ghost" size="icon" href={`/admin/team/${row.id}`} aria-label={`Edit ${row.name}`}>
            <Pencil className="h-4 w-4" />
          </AdminButton>
          <ActionsMenu
            label={`More actions for ${row.name}`}
            items={[
              { label: "Edit", icon: Pencil, onSelect: () => router.push(`/admin/team/${row.id}`) },
              { label: "View profile", icon: ExternalLink, onSelect: () => window.open(row.profilePath, "_blank") },
              {
                label: "QR code",
                icon: QrCode,
                disabled: row.qrStatus === "disabled",
                onSelect: () =>
                  setPreview({
                    id: row.id,
                    name: row.name,
                    position: row.position,
                    employeeId: row.employeeId,
                    qrVersion: row.qrVersion,
                    profileUrl: row.profileUrl,
                  }),
              },
              { label: "Analytics", icon: BarChart3, onSelect: () => router.push(`/admin/team/${row.id}/analytics`) },
              {
                label: row.isActive ? "Deactivate" : "Activate",
                icon: Power,
                hidden: !canManage,
                disabled: isPending,
                onSelect: () =>
                  run(
                    () => setTeamMemberActiveAction(row.id, !row.isActive),
                    row.isActive ? `${row.name} deactivated.` : `${row.name} activated.`,
                  ),
              },
              {
                label: row.isVerified ? "Remove verification" : "Mark verified",
                icon: BadgeCheck,
                hidden: !canManage,
                disabled: isPending,
                onSelect: () =>
                  run(
                    () => setTeamMemberVerifiedAction(row.id, !row.isVerified),
                    row.isVerified ? "Verification removed." : `${row.name} marked as verified.`,
                  ),
              },
              { label: "Delete", icon: Trash2, danger: true, hidden: !canDelete, onSelect: () => setToDelete(row) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Search by name, designation, department or employee ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          aria-label="Search team members"
        />
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No team members found." />

      <QrPreviewDialog member={preview} onClose={() => setPreview(null)} />
      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.name ?? ""}?`}
        description="Their public profile, URL history and analytics are removed permanently. Printed QR codes will show “Profile Not Found”. Consider deactivating instead."
        confirmLabel="Delete"
        pending={isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          const target = toDelete;
          if (!target) return;
          startTransition(async () => {
            const result = await deleteTeamMemberAction(target.id);
            if (result.success) {
              toast.success(`${target.name} deleted.`);
              setToDelete(null);
              router.refresh();
            } else {
              toast.error(result.error);
            }
          });
        }}
      />
    </div>
  );
}
