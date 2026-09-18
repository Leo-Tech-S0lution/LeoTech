import { cn } from "@/lib/utils/cn";

type Status =
  | "draft"
  | "published"
  | "archived"
  | "open"
  | "closed"
  | "new"
  | "contacted";

const STYLES: Record<Status, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-green-100 text-green-700",
  open: "bg-green-100 text-green-700",
  archived: "bg-slate-100 text-slate-500",
  closed: "bg-slate-100 text-slate-500",
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = STYLES[status as Status] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className,
      )}
    >
      {status}
    </span>
  );
}

export function BooleanBadge({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        value ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500",
      )}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}
