"use client";

import { AdminButton } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils/cn";

interface SubmitButtonProps {
  pending: boolean;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: React.ComponentProps<typeof AdminButton>["variant"];
}

export function SubmitButton({ pending, children, pendingLabel = "Saving…", className, variant = "primary" }: SubmitButtonProps) {
  return (
    <AdminButton type="submit" variant={variant} disabled={pending} className={cn(className)}>
      {pending ? pendingLabel : children}
    </AdminButton>
  );
}
