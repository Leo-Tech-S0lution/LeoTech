import { cn } from "@/lib/utils/cn";
import { QR_STATUS_LABELS, type QrStatus } from "@/lib/team/profile";

const pill = "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";

const QR_STYLES: Record<QrStatus, string> = {
  generated: "bg-green-100 text-green-700",
  not_generated: "bg-amber-100 text-amber-700",
  disabled: "bg-slate-100 text-slate-500",
};

export function QrStatusBadge({ status }: { status: QrStatus }) {
  return <span className={cn(pill, QR_STYLES[status])}>{QR_STATUS_LABELS[status]}</span>;
}

export function ProfileStatusBadges({ isActive, published }: { isActive: boolean; published: boolean }) {
  return (
    <div className="flex flex-wrap gap-1">
      <span className={cn(pill, isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
        {isActive ? "Active" : "Inactive"}
      </span>
      <span className={cn(pill, published ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>
        {published ? "Public" : "Private"}
      </span>
    </div>
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <span className={cn(pill, verified ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>
      {verified ? "✓ Verified" : "Unverified"}
    </span>
  );
}

export function CompletionMeter({ percent }: { percent: number }) {
  const color = percent >= 80 ? "bg-green-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2" title={`Profile ${percent}% complete`}>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs tabular-nums text-slate-500">{percent}%</span>
    </div>
  );
}
