import { cn } from "@/lib/utils/cn";

interface SectionLabelProps {
  index: string; // e.g. "01"
  label: string; // e.g. "ABOUT"
  dark?: boolean;
  className?: string;
}

export function SectionLabel({ index, label, dark, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "font-mono text-xs tracking-[0.2em]",
          dark ? "text-blue-400" : "text-blue-500",
        )}
      >
        {index}
      </span>
      <span
        className={cn(
          "h-px w-8",
          dark ? "bg-blue-400/40" : "bg-blue-500/30",
        )}
      />
      <span
        className={cn(
          "font-mono text-xs font-medium uppercase tracking-[0.25em]",
          dark ? "text-slate-300" : "text-slate-500",
        )}
      >
        {label}
      </span>
    </div>
  );
}
