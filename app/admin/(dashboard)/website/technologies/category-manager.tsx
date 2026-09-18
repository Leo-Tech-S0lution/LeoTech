"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import { technologyCategorySchema, type TechnologyCategoryInput } from "@/lib/validation/technologies";
import { createTechCategoryAction, updateTechCategoryAction, deleteTechCategoryAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input } from "@/components/admin/ui/input";
import { AdminButton } from "@/components/admin/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import { toSlug } from "@/lib/utils/text";
import { TechList } from "./tech-list";
import { cn } from "@/lib/utils/cn";
import type { TechnologyCategory, Technology } from "@/lib/db/schema";

interface CategoryManagerProps {
  categories: TechnologyCategory[];
  technologiesByCategory: Record<string, Technology[]>;
}

export function CategoryManager({ categories, technologiesByCategory }: CategoryManagerProps) {
  const [openId, setOpenId] = useState<string | null>(categories[0]?.id ?? null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-navy-900">Technology Categories</h2>
        {!adding ? (
          <AdminButton size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add category
          </AdminButton>
        ) : null}
      </div>

      <div className="space-y-3">
        {adding ? <CategoryRow onDone={() => setAdding(false)} /> : null}

        {categories.map((cat) => (
          <div key={cat.id} className="rounded-lg border border-slate-100">
            {editingId === cat.id ? (
              <div className="p-3">
                <CategoryRow category={cat} onDone={() => setEditingId(null)} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === cat.id ? null : cat.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", openId === cat.id && "rotate-180")}
                    />
                    <span className="font-medium text-navy-900">{cat.name}</span>
                    <span className="text-xs text-slate-400">
                      ({(technologiesByCategory[cat.id] ?? []).length})
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <AdminButton variant="ghost" size="icon" onClick={() => setEditingId(cat.id)} aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </AdminButton>
                    <DeleteCategory id={cat.id} label={cat.name} />
                  </div>
                </div>
                {openId === cat.id ? (
                  <div className="pb-3">
                    <TechList categoryId={cat.id} items={technologiesByCategory[cat.id] ?? []} />
                  </div>
                ) : null}
              </>
            )}
          </div>
        ))}

        {categories.length === 0 && !adding ? (
          <p className="py-6 text-center text-sm text-slate-400">No categories yet.</p>
        ) : null}
      </div>
    </div>
  );
}

function CategoryRow({ category, onDone }: { category?: TechnologyCategory; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TechnologyCategoryInput>({
    resolver: zodResolver(technologyCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      order: category?.order ?? 0,
    },
  });

  function onSubmit(data: TechnologyCategoryInput) {
    startTransition(async () => {
      const result = category
        ? await updateTechCategoryAction(category.id, data)
        : await createTechCategoryAction(data);
      if (result.success) {
        toast.success("Category saved.");
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
            if (!category) setValue("slug", toSlug(e.target.value));
          }}
        />
      </FormField>
      <FormField label="Slug" required error={errors.slug?.message}>
        <Input {...register("slug")} className="w-40" />
      </FormField>
      <FormField label="Order" error={errors.order?.message}>
        <Input type="number" {...register("order", { valueAsNumber: true })} className="w-20" />
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

function DeleteCategory({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteTechCategoryAction(id);
      if (result.success) {
        toast.success("Category deleted.");
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
        description="This also deletes every technology listed under it."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
