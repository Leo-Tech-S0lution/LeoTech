import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border border-dashed border-border py-16 text-center text-sm text-slate-500",
        className,
      )}
    >
      {message}
    </div>
  );
}
