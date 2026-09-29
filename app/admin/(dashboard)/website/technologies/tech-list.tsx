"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { technologySchema, type TechnologyInput } from "@/lib/validation/technologies";
import { createTechnologyAction, updateTechnologyAction, deleteTechnologyAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { MediaPicker } from "@/components/admin/media-picker";
import { resolveTechLogo } from "@/lib/tech-logos";
import { Input } from "@/components/admin/ui/input";
import { AdminButton } from "@/components/admin/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import type { Technology } from "@/lib/db/schema";

export function TechList({ categoryId, items }: { categoryId: string; items: Technology[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="ml-4 space-y-2 border-l border-slate-100 pl-4">
      {items.map((tech) =>
        editingId === tech.id ? (
          <TechRow key={tech.id} categoryId={categoryId} tech={tech} onDone={() => setEditingId(null)} />
        ) : (
          <div key={tech.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50/60 px-3 py-1.5">
            <span className="flex items-center gap-2.5 text-sm text-slate-700">
              <TechThumb name={tech.name} icon={tech.icon} />
              {tech.name}
              {!tech.icon && resolveTechLogo(tech.name, null) && (
                <span className="text-[10px] uppercase tracking-wide text-slate-400">built-in logo</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <AdminButton variant="ghost" size="icon" onClick={() => setEditingId(tech.id)} aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </AdminButton>
              <DeleteTech id={tech.id} label={tech.name} />
            </div>
          </div>
        ),
      )}
      {adding ? (
        <TechRow categoryId={categoryId} onDone={() => setAdding(false)} />
      ) : (
        <AdminButton size="sm" variant="ghost" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add technology
        </AdminButton>
      )}
    </div>
  );
}

/** Same logo the homepage shows: uploaded logo, else built-in, else initials. */
function TechThumb({ name, icon }: { name: string; icon: string | null }) {
  const src = resolveTechLogo(name, icon);
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-contain p-1" />
      ) : (
        <span className="text-[10px] font-semibold text-slate-400">{name.slice(0, 2)}</span>
      )}
    </span>
  );
}

function TechRow({ categoryId, tech, onDone }: { categoryId: string; tech?: Technology; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(technologySchema),
    defaultValues: {
      categoryId,
      name: tech?.name ?? "",
      icon: tech?.icon ?? "",
      order: tech?.order ?? 0,
    },
  });

  function onSubmit(data: TechnologyInput) {
    startTransition(async () => {
      const result = tech ? await updateTechnologyAction(tech.id, data) : await createTechnologyAction(data);
      if (result.success) {
        toast.success("Saved.");
        onDone();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-2 rounded-md border border-blue-200 bg-blue-50/40 p-2">
      <FormField label="Name" required error={errors.name?.message}>
        <Input {...register("name")} className="w-40" />
      </FormField>
      <FormField label="Order" error={errors.order?.message}>
        <Input type="number" {...register("order", { valueAsNumber: true })} className="w-20" />
      </FormField>
      <FormField label="Logo" error={errors.icon?.message}>
        <Controller
          control={control}
          name="icon"
          render={({ field }) => <MediaPicker value={field.value} onChange={field.onChange} label="Logo" />}
        />
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

function DeleteTech({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteTechnologyAction(id);
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
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
