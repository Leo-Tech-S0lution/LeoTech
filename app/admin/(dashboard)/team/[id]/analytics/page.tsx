import { notFound } from "next/navigation";
import { Eye, CalendarDays, CalendarRange, Clock, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { getMemberAnalytics, getTeamMemberByIdAdmin } from "@/lib/db/queries/team";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { AdminButton } from "@/components/admin/ui/button";

export default async function MemberAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const member = await getTeamMemberByIdAdmin(id);
  if (!member) notFound();

  if (!can(user, "analytics.view")) {
    return <p className="text-sm text-slate-500">You don&apos;t have permission to view analytics.</p>;
  }

  const stats = await getMemberAnalytics(member.id);
  const peak = Math.max(1, ...stats.daily.map((d) => d.views));

  return (
    <div>
      <PageHeader
        title="Profile Analytics"
        description={`${member.name} — anonymous profile views (bots and signed-in admins excluded).`}
        actions={
          <AdminButton href={`/admin/team/${member.id}`} variant="outline" size="sm">
            <Pencil className="h-3.5 w-3.5" />
            Edit Member
          </AdminButton>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total views" value={stats.total} icon={Eye} />
        <StatCard label="Today" value={stats.today} icon={Clock} />
        <StatCard label="Last 7 days" value={stats.week} icon={CalendarDays} />
        <StatCard label="Last 30 days" value={stats.month} icon={CalendarRange} />
        <StatCard
          label="Last viewed"
          value={stats.lastViewed ? stats.lastViewed.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
          subvalue={stats.lastViewed ? stats.lastViewed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : undefined}
        />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-sm font-semibold text-heading">Views — last 30 days</h2>
        <div
          className="mt-4 flex h-40 items-end gap-[3px]"
          role="img"
          aria-label={`Daily profile views over the last 30 days, peaking at ${peak}.`}
        >
          {stats.daily.map((d) => (
            <div key={d.day} className="group relative flex h-full flex-1 items-end">
              <div
                className="w-full rounded-t-sm bg-blue-500 transition-colors group-hover:bg-blue-600"
                style={{ height: d.views ? `${Math.max(4, (d.views / peak) * 100)}%` : "2px", opacity: d.views ? 1 : 0.25 }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-navy-900 px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                {d.day.slice(5)}: {d.views}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>{stats.daily[0]?.day}</span>
          <span>Today</span>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Breakdown title="Devices" rows={stats.devices} />
        <Breakdown title="Browsers" rows={stats.browsers} />
        <Breakdown title="Referrers" rows={stats.referrers} emptyLabel="Direct / QR scans (no referrer)" />
      </div>
    </div>
  );
}

function Breakdown({ title, rows, emptyLabel }: { title: string; rows: { label: string; views: number }[]; emptyLabel?: string }) {
  const total = rows.reduce((sum, r) => sum + r.views, 0) || 1;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-sm font-semibold text-heading">{title}</h2>
      <p className="text-xs text-slate-400">Last 30 days</p>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No views yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between text-sm">
                <span className="truncate capitalize text-slate-700">
                  {r.label === "Unknown" && emptyLabel ? emptyLabel : r.label}
                </span>
                <span className="tabular-nums text-slate-500">{r.views}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${(r.views / total) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
