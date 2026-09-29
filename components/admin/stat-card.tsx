import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: number | string;
  subvalue?: string;
  icon?: LucideIcon;
  href?: string;
  className?: string;
}

export function StatCard({ label, value, subvalue, icon: Icon, href, className }: StatCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-heading">{value}</p>
          {subvalue ? <p className="mt-1 text-xs text-slate-400">{subvalue}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
