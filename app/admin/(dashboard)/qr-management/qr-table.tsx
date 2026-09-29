"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ExternalLink,
  Eye,
  Download,
  Printer,
  Copy,
  RefreshCw,
  BarChart3,
  Pencil,
  QrCode,
  FileImage,
  Power,
} from "lucide-react";
import { Input, Select, Checkbox } from "@/components/admin/ui/input";
import { AdminButton } from "@/components/admin/ui/button";
import { ActionsMenu } from "@/components/admin/actions-menu";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/admin/toast";
import { QrStatusBadge, ProfileStatusBadges, VerifiedBadge } from "@/components/admin/team/badges";
import { QrPreviewDialog, type QrPreviewMember } from "@/components/admin/team/qr-preview-dialog";
import { copyProfileUrl, downloadManyQr, downloadQr, openQrPrint } from "@/components/admin/team/qr-client";
import { generateQrAction, regenerateQrAction, setQrEnabledAction } from "./actions";
import type { QrStatus } from "@/lib/team/profile";

export interface QrRow {
  id: string;
  name: string;
  position: string | null;
  department: string | null;
  employeeId: string | null;
  image: string | null;
  isActive: boolean;
  published: boolean;
  isVerified: boolean;
  qrStatus: QrStatus;
  qrVersion: number;
  qrGeneratedAt: string | null;
  updatedAt: string;
  profilePath: string;
  profileUrl: string;
  views: number;
}

interface QrTableProps {
  rows: QrRow[];
  canManageQr: boolean;
  canManageTeam: boolean;
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export function QrTable({ rows, canManageQr, canManageTeam }: QrTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [qrFilter, setQrFilter] = useState("");
  const [profileFilter, setProfileFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<QrPreviewMember | null>(null);
  const [toRegenerate, setToRegenerate] = useState<QrRow | null>(null);

  const departments = useMemo(
    () => Array.from(new Set(rows.map((r) => r.department).filter((d): d is string => Boolean(d)))).sort(),
    [rows],
  );

  const q = search.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (q && ![r.name, r.employeeId, r.position].some((v) => v?.toLowerCase().includes(q))) return false;
    if (department && r.department !== department) return false;
    if (qrFilter && r.qrStatus !== qrFilter) return false;
    if (profileFilter === "active" && !r.isActive) return false;
    if (profileFilter === "inactive" && r.isActive) return false;
    if (profileFilter === "public" && !r.published) return false;
    if (profileFilter === "private" && r.published) return false;
    if (verifiedFilter === "verified" && !r.isVerified) return false;
    if (verifiedFilter === "unverified" && r.isVerified) return false;
    return true;
  });

  const selectedRows = filtered.filter((r) => selected.has(r.id));
  const selectedEnabled = selectedRows.filter((r) => r.qrStatus !== "disabled");
  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((r) => r.id)));
  }

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

  function previewOf(r: QrRow): QrPreviewMember {
    return {
      id: r.id,
      name: r.name,
      position: r.position,
      employeeId: r.employeeId,
      qrVersion: r.qrVersion,
      profileUrl: r.profileUrl,
    };
  }

  const bulkIds = selectedEnabled.map((r) => r.id);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search name, employee ID, designation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          aria-label="Search team members"
        />
        <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-auto" aria-label="Filter by department">
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
        <Select value={qrFilter} onChange={(e) => setQrFilter(e.target.value)} className="w-auto" aria-label="Filter by QR status">
          <option value="">Any QR status</option>
          <option value="generated">Generated</option>
          <option value="not_generated">Not Generated</option>
          <option value="disabled">Disabled</option>
        </Select>
        <Select value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)} className="w-auto" aria-label="Filter by profile status">
          <option value="">Any profile status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </Select>
        <Select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} className="w-auto" aria-label="Filter by verification">
          <option value="">Any verification</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </Select>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <span className="mr-2 text-xs text-slate-500">
          {selectedRows.length} selected{selectedRows.length !== selectedEnabled.length ? ` (${selectedEnabled.length} with QR enabled)` : ""}
        </span>
        {canManageQr ? (
          <AdminButton
            size="sm"
            disabled={bulkIds.length === 0 || isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await generateQrAction(bulkIds);
                if (result.success) {
                  toast.success(result.data > 0 ? `Generated ${result.data} QR code(s).` : "Selected QR codes were already generated.");
                  router.refresh();
                } else toast.error(result.error);
              })
            }
          >
            <QrCode className="h-3.5 w-3.5" /> Generate Selected
          </AdminButton>
        ) : null}
        <AdminButton variant="outline" size="sm" disabled={bulkIds.length === 0} onClick={() => downloadManyQr(bulkIds, "png")}>
          <Download className="h-3.5 w-3.5" /> Download PNG
        </AdminButton>
        <AdminButton variant="outline" size="sm" disabled={bulkIds.length === 0} onClick={() => downloadManyQr(bulkIds, "svg")}>
          <FileImage className="h-3.5 w-3.5" /> Download SVG
        </AdminButton>
        <AdminButton variant="outline" size="sm" disabled={bulkIds.length === 0} onClick={() => openQrPrint(bulkIds, "sheet")}>
          <Printer className="h-3.5 w-3.5" /> Print A4 Sheet
        </AdminButton>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No team members match these filters." className="rounded-xl border-slate-200" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allSelected} onChange={toggleAll} aria-label="Select all visible members" />
                </th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Profile URL</th>
                <th className="px-4 py-3">QR status</th>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">QR generated</th>
                <th className="px-4 py-3">Last updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const disabled = r.qrStatus === "disabled";
                return (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Checkbox checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Select ${r.name}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100">
                          {r.image ? <Image src={r.image} alt="" fill className="object-cover" sizes="36px" /> : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-heading">{r.name}</p>
                          <p className="text-xs text-slate-400">{r.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.employeeId ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => copyProfileUrl(r.profileUrl)}
                        className="max-w-[180px] truncate font-mono text-xs text-slate-500 hover:text-blue-600"
                        title={`Copy ${r.profileUrl}`}
                      >
                        {r.profilePath}
                      </button>
                    </td>
                    <td className="px-4 py-3"><QrStatusBadge status={r.qrStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <ProfileStatusBadges isActive={r.isActive} published={r.published} />
                        <VerifiedBadge verified={r.isVerified} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {fmt(r.qrGeneratedAt)}
                      {r.qrGeneratedAt ? <span className="block text-slate-400">v{r.qrVersion}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmt(r.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <AdminButton
                          variant="ghost"
                          size="icon"
                          disabled={disabled}
                          onClick={() => setPreview(previewOf(r))}
                          aria-label={`Preview QR for ${r.name}`}
                        >
                          <QrCode className="h-4 w-4" />
                        </AdminButton>
                        <ActionsMenu
                          label={`QR actions for ${r.name}`}
                          items={[
                            { label: "View profile", icon: ExternalLink, onSelect: () => window.open(r.profilePath, "_blank") },
                            { label: "Preview QR", icon: Eye, disabled, onSelect: () => setPreview(previewOf(r)) },
                            { label: "Download PNG", icon: Download, disabled, onSelect: () => downloadQr(r.id, "png") },
                            { label: "Download SVG", icon: FileImage, disabled, onSelect: () => downloadQr(r.id, "svg") },
                            { label: "Print QR", icon: Printer, disabled, onSelect: () => openQrPrint([r.id], "card") },
                            { label: "Copy profile URL", icon: Copy, onSelect: () => copyProfileUrl(r.profileUrl) },
                            {
                              label: "Regenerate QR",
                              icon: RefreshCw,
                              hidden: !canManageQr,
                              disabled: disabled || isPending,
                              onSelect: () => setToRegenerate(r),
                            },
                            {
                              label: disabled ? "Enable QR" : "Disable QR",
                              icon: Power,
                              hidden: !canManageTeam,
                              disabled: isPending,
                              onSelect: () =>
                                run(
                                  () => setQrEnabledAction(r.id, disabled),
                                  disabled ? `QR enabled for ${r.name}.` : `QR disabled for ${r.name}.`,
                                ),
                            },
                            { label: "View analytics", icon: BarChart3, onSelect: () => router.push(`/admin/team/${r.id}/analytics`) },
                            { label: "Edit member", icon: Pencil, onSelect: () => router.push(`/admin/team/${r.id}`) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <QrPreviewDialog member={preview} onClose={() => setPreview(null)} />
      <ConfirmDialog
        open={toRegenerate !== null}
        title={`Regenerate QR for ${toRegenerate?.name ?? ""}?`}
        description="Regenerating the QR does not change the profile URL — already printed cards keep working. It only issues a fresh file with a new version number."
        confirmLabel="Regenerate"
        destructive={false}
        pending={isPending}
        onCancel={() => setToRegenerate(null)}
        onConfirm={() => {
          const target = toRegenerate;
          if (!target) return;
          setToRegenerate(null);
          run(() => regenerateQrAction(target.id), `QR regenerated for ${target.name}.`);
        }}
      />
    </div>
  );
}
