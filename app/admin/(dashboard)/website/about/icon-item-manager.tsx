"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  whyLeotechItemSchema,
  type WhyLeotechItemInput,
} from "@/lib/validation/content";
import { FormField } from "@/components/admin/form-field";
import { Input, Textarea } from "@/components/admin/ui/input";
import { IconPicker } from "@/components/admin/icon-picker";
import { AdminButton } from "@/components/admin/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import type { ActionResult } from "@/lib/validation/common";

interface IconItem {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order: number;
}

interface IconItemManagerProps<T extends IconItem> {
  title: string;
  hint: string;
  items: T[];
  createAction: (input: unknown) => Promise<ActionResult<T>>;
  updateAction: (id: string, input: unknown) => Promise<ActionResult<T>>;
  deleteAction: (id: string) => Promise<ActionResult>;
}

/** Shared manager for WhyLeotechItem and ProcessStep — identical {title, description, icon, order} shape. */
export function IconItemManager<T extends IconItem>({
  title,
  hint,
  items,
  createAction,
  updateAction,
  deleteAction,
}: IconItemManagerProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold text-navy-900">{title}</h2>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
        {!adding ? (
          <AdminButton size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add item
          </AdminButton>
        ) : null}
      </div>

      <div className="space-y-2">
        {items.map((item) =>
          editingId === item.id ? (
            <ItemRow
              key={item.id}
              item={item}
              updateAction={updateAction}
              createAction={createAction}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
            >
              <div className="flex items-center gap-2.5 text-sm">
                <IconPreview icon={item.icon} />
                <div>
                  <p className="font-medium text-navy-900">{item.title}</p>
                  {item.description ? (
                    <p className="line-clamp-1 text-xs text-slate-400">{item.description}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <AdminButton variant="ghost" size="icon" onClick={() => setEditingId(item.id)} aria-label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </AdminButton>
                <DeleteItem id={item.id} label={item.title} deleteAction={deleteAction} />
              </div>
            </div>
          ),
        )}
        {items.length === 0 && !adding ? (
          <p className="py-6 text-center text-sm text-slate-400">No items yet.</p>
        ) : null}
        {adding ? (
          <ItemRow createAction={createAction} updateAction={updateAction} onDone={() => setAdding(false)} />
        ) : null}
      </div>
    </div>
  );
}

function IconPreview({ icon }: { icon: string | null }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-500">
      <DynamicIcon icon={icon} className="h-4 w-4" />
    </div>
  );
}

function ItemRow<T extends IconItem>({
  item,
  createAction,
  updateAction,
  onDone,
}: {
  item?: T;
  createAction: (input: unknown) => Promise<ActionResult<T>>;
  updateAction: (id: string, input: unknown) => Promise<ActionResult<T>>;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(whyLeotechItemSchema),
    defaultValues: {
      title: item?.title ?? "",
      description: item?.description ?? "",
      icon: item?.icon ?? "cpu",
      order: item?.order ?? 0,
    },
  });

  function onSubmit(data: WhyLeotechItemInput) {
    startTransition(async () => {
      const result = item ? await updateAction(item.id, data) : await createAction(data);
      if (result.success) {
        toast.success("Saved.");
        onDone();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/40 p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="Title" required error={errors.title?.message} className="sm:col-span-2">
          <Input {...register("title")} />
        </FormField>
        <FormField label="Order" error={errors.order?.message}>
          <Input type="number" {...register("order", { valueAsNumber: true })} />
        </FormField>
      </div>
      <FormField label="Description" error={errors.description?.message}>
        <Textarea rows={2} {...register("description")} />
      </FormField>
      <FormField label="Icon" error={errors.icon?.message}>
        <Controller name="icon" control={control} render={({ field }) => <IconPicker value={field.value ?? ""} onChange={field.onChange} />} />
      </FormField>
      <div className="flex items-center gap-2">
        <SubmitButton pending={isPending} pendingLabel="Saving…">
          Save
        </SubmitButton>
        <AdminButton type="button" variant="outline" size="sm" onClick={onDone}>
          Cancel
        </AdminButton>
      </div>
    </form>
  );
}

function DeleteItem({
  id,
  label,
  deleteAction,
}: {
  id: string;
  label: string;
  deleteAction: (id: string) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteAction(id);
      if (result.success) {
        toast.success("Deleted.");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <AdminButton
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${label}`}
        className="text-slate-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </AdminButton>
      <ConfirmDialog
        open={open}
        title={`Delete "${label}"?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
