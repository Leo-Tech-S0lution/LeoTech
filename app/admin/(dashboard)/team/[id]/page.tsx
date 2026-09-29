import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { getSlugHistoryAdmin, getTeamMemberByIdAdmin } from "@/lib/db/queries/team";
import { profileCompleteness, profilePath, profileUrl } from "@/lib/team/profile";
import { PageHeader } from "@/components/admin/page-header";
import { AdminButton } from "@/components/admin/ui/button";
import { CompletionMeter } from "@/components/admin/team/badges";
import { DigitalIdPanel } from "@/components/admin/team/digital-id-panel";
import { TeamForm } from "../team-form";

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const member = await getTeamMemberByIdAdmin(id);
  if (!member) notFound();

  const history = await getSlugHistoryAdmin(member.id);
  const completeness = profileCompleteness(member);

  return (
    <div>
      <PageHeader
        title="Edit Team Member"
        description={member.name}
        actions={
          <>
            <AdminButton href={`/admin/team/${member.id}/analytics`} variant="outline" size="sm">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </AdminButton>
            <AdminButton href={profilePath(member.slug)} target="_blank" variant="outline" size="sm">
              <ExternalLink className="h-3.5 w-3.5" />
              Preview Profile
            </AdminButton>
          </>
        }
      />

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-heading">Profile completion</h2>
            {completeness.missing.length > 0 ? (
              <p className="mt-1 text-xs text-slate-500">Missing: {completeness.missing.join(", ")}</p>
            ) : (
              <p className="mt-1 text-xs text-green-600">Everything is filled in.</p>
            )}
          </div>
          <CompletionMeter percent={completeness.percent} />
        </div>
        {history.length > 0 && (
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            Previous URLs (redirect here):{" "}
            {history.map((h, i) => (
              <span key={h.id}>
                {i > 0 ? ", " : ""}
                <Link href={profilePath(h.slug)} target="_blank" className="font-mono hover:text-blue-600">
                  /team/{h.slug}
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>

      <TeamForm
        member={member}
        canManage={can(user, "team.manage")}
        qrPanel={
          <DigitalIdPanel
            memberId={member.id}
            name={member.name}
            profileUrl={profileUrl(member.slug)}
            profilePath={profilePath(member.slug)}
            qrEnabled={member.qrEnabled}
            qrVersion={member.qrVersion}
            qrGeneratedAt={member.qrGeneratedAt?.toISOString() ?? null}
            canManageQr={can(user, "qr.manage")}
          />
        }
      />
    </div>
  );
}
