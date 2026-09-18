"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import type { ActionResult } from "@/lib/validation/common";

interface DeleteButtonProps {
  action: () => Promise<ActionResult>;
  itemLabel: string;
  onDeleted?: () => void;
  iconOnly?: boolean;
}

/** Icon/text delete button wired to a confirm dialog + a server action returning ActionResult. */
export function DeleteButton({ action, itemLabel, onDeleted, iconOnly = true }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(`${itemLabel} deleted.`);
        setOpen(false);
        onDeleted?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <AdminButton
        variant="ghost"
        size={iconOnly ? "icon" : "sm"}
        onClick={() => setOpen(true)}
        aria-label={`Delete ${itemLabel}`}
        className="text-slate-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
        {iconOnly ? null : "Delete"}
      </AdminButton>
      <ConfirmDialog
        open={open}
        title={`Delete ${itemLabel}?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
