"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { FormField } from "@/components/admin/form-field";
import { Input } from "@/components/admin/ui/input";
import { AdminButton } from "@/components/admin/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import { toSlug } from "@/lib/utils/text";
import type { ActionResult } from "@/lib/validation/common";

interface NameSlugItem {
  id: string;
  name: string;
  slug: string;
}

const schema = z.object({ name: z.string().trim().min(1, "Name is required."), slug: z.string().trim().min(1, "Slug is required.") });
type SchemaInput = z.infer<typeof schema>;

interface NameSlugManagerProps<T extends NameSlugItem> {
  title: string;
  items: T[];
  createAction: (input: unknown) => Promise<ActionResult<T>>;
  updateAction: (id: string, input: unknown) => Promise<ActionResult<T>>;
  deleteAction: (id: string) => Promise<ActionResult>;
}

export function NameSlugManager<T extends NameSlugItem>({
  title,
  items,
  createAction,
  updateAction,
  deleteAction,
}: NameSlugManagerProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-heading">{title}</h2>
        {!adding ? (
          <AdminButton size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add
          </AdminButton>
        ) : null}
      </div>

      <div className="space-y-2">
        {adding ? (
          <Row createAction={createAction} updateAction={updateAction} onDone={() => setAdding(false)} />
        ) : null}
        {items.map((item) =>
          editingId === item.id ? (
            <Row key={item.id} item={item} createAction={createAction} updateAction={updateAction} onDone={() => setEditingId(null)} />
          ) : (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="text-sm">
                <span className="font-medium text-heading">{item.name}</span>{" "}
                <span className="text-slate-400">/{item.slug}</span>
              </div>
              <div className="flex items-center gap-1">
                <AdminButton variant="ghost" size="icon" onClick={() => setEditingId(item.id)} aria-label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </AdminButton>
                <DeleteRow id={item.id} label={item.name} deleteAction={deleteAction} />
              </div>
            </div>
          ),
        )}
        {items.length === 0 && !adding ? <p className="py-6 text-center text-sm text-slate-400">Nothing yet.</p> : null}
      </div>
    </div>
  );
}

function Row<T extends NameSlugItem>({
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
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: item?.name ?? "", slug: item?.slug ?? "" },
  });

  function onSubmit(data: SchemaInput) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-2 rounded-lg border border-blue-200 bg-blue-50/40 p-3">
      <FormField label="Name" required error={errors.name?.message}>
        <Input
          {...register("name")}
          className="w-48"
          onChange={(e) => {
            register("name").onChange(e);
            if (!item) setValue("slug", toSlug(e.target.value));
          }}
        />
      </FormField>
      <FormField label="Slug" required error={errors.slug?.message}>
        <Input {...register("slug")} className="w-40" />
      </FormField>
      <SubmitButton pending={isPending} pendingLabel="Saving…">
        Save
      </SubmitButton>
      <AdminButton type="button" variant="outline" size="sm" onClick={onDone}>
        Cancel
      </AdminButton>
    </form>
  );
}

function DeleteRow({ id, label, deleteAction }: { id: string; label: string; deleteAction: (id: string) => Promise<ActionResult> }) {
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
      <ConfirmDialog open={open} title={`Delete "${label}"?`} confirmLabel="Delete" pending={isPending} onConfirm={handleConfirm} onCancel={() => setOpen(false)} />
    </>
  );
}
