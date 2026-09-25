import { Users, QrCode, CheckCircle2, Ban, ScanLine } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import {
  getAllTeamMembersAdmin,
  getProfileViewTotals,
  getProfileViewsByMember,
} from "@/lib/db/queries/team";
import { profilePath, profileUrl, qrStatus } from "@/lib/team/profile";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { QrTable, type QrRow } from "./qr-table";

export default async function QrManagementPage() {
  const user = await requireAdmin();
  if (!can(user, "qr.view")) {
    return <p className="text-sm text-slate-500">You don&apos;t have permission to view QR codes.</p>;
  }

  const [members, totals, byMember] = await Promise.all([
    getAllTeamMembersAdmin(),
    getProfileViewTotals(),
    getProfileViewsByMember(),
  ]);

  const rows: QrRow[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    position: m.position,
    department: m.department,
    employeeId: m.employeeId,
    image: m.image,
    isActive: m.isActive,
    published: m.published,
    isVerified: m.isVerified,
    qrStatus: qrStatus(m),
    qrVersion: m.qrVersion,
    qrGeneratedAt: m.qrGeneratedAt?.toISOString() ?? null,
    updatedAt: m.updatedAt.toISOString(),
    profilePath: profilePath(m.slug),
    profileUrl: profileUrl(m.slug),
    views: byMember[m.id]?.total ?? 0,
  }));

  const enabled = rows.filter((r) => r.qrStatus !== "disabled").length;
  const generated = rows.filter((r) => r.qrStatus === "generated").length;
  const disabled = rows.length - enabled;
  const topViewed = [...rows].sort((a, b) => b.views - a.views).filter((r) => r.views > 0).slice(0, 6);
  const maxViews = Math.max(1, ...topViewed.map((r) => r.views));

  return (
    <div>
      <PageHeader
        title="QR Management"
        description="Manage digital ID QR codes for Leo Tech Solution team members. Each QR encodes only the member's public profile URL."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total team members" value={rows.length} icon={Users} href="/admin/team" />
        <StatCard label="QR enabled" value={enabled} icon={QrCode} />
        <StatCard label="QR generated" value={generated} icon={CheckCircle2} />
        <StatCard label="QR disabled" value={disabled} icon={Ban} />
        <StatCard
          label="Total profile scans / views"
          value={totals.total}
          subvalue={`${totals.today} today · ${totals.week} this week · ${totals.month} this month`}
          icon={ScanLine}
        />
      </div>

      {topViewed.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-sm font-semibold text-navy-900">Views by team member</h2>
          <ul className="mt-3 space-y-2.5">
            {topViewed.map((r) => (
              <li key={r.id} className="grid grid-cols-[140px_1fr_48px] items-center gap-3 text-sm sm:grid-cols-[200px_1fr_56px]">
                <span className="truncate text-slate-700">{r.name}</span>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(r.views / maxViews) * 100}%` }} />
                </div>
                <span className="text-right tabular-nums text-slate-500">{r.views}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6">
        <QrTable rows={rows} canManageQr={can(user, "qr.manage")} canManageTeam={can(user, "team.manage")} />
      </div>
    </div>
  );
}
