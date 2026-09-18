"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { statisticSchema, type StatisticInput } from "@/lib/validation/content";
import { createStatisticAction, updateStatisticAction, deleteStatisticAction } from "./actions";
import { FormField } from "@/components/admin/form-field";
import { Input } from "@/components/admin/ui/input";
import { AdminButton } from "@/components/admin/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import type { Statistic } from "@/lib/db/schema";

export function StatisticsManager({ statistics }: { statistics: Statistic[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold text-navy-900">Statistics</h2>
          <p className="text-xs text-slate-400">Powers the animated counters on the homepage and About page.</p>
        </div>
        {!adding ? (
          <AdminButton size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add stat
          </AdminButton>
        ) : null}
      </div>

      <div className="space-y-2">
        {statistics.map((stat) =>
          editingId === stat.id ? (
            <StatRow key={stat.id} stat={stat} onDone={() => setEditingId(null)} />
          ) : (
            <div
              key={stat.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
            >
              <div className="text-sm">
                <span className="font-medium text-navy-900">
                  {stat.value}
                  {stat.suffix}
                </span>{" "}
                <span className="text-slate-500">{stat.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <AdminButton variant="ghost" size="icon" onClick={() => setEditingId(stat.id)} aria-label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </AdminButton>
                <DeleteStat id={stat.id} label={stat.label} />
              </div>
            </div>
          ),
        )}
        {statistics.length === 0 && !adding ? (
          <p className="py-6 text-center text-sm text-slate-400">No statistics yet.</p>
        ) : null}
        {adding ? <StatRow onDone={() => setAdding(false)} /> : null}
      </div>
    </div>
  );
}

function StatRow({ stat, onDone }: { stat?: Statistic; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StatisticInput>({
    resolver: zodResolver(statisticSchema),
    defaultValues: {
      label: stat?.label ?? "",
      value: stat?.value ?? 0,
      suffix: stat?.suffix ?? "",
      order: stat?.order ?? 0,
    },
  });

  function onSubmit(data: StatisticInput) {
    startTransition(async () => {
      const result = stat ? await updateStatisticAction(stat.id, data) : await createStatisticAction(data);
      if (result.success) {
        toast.success("Statistic saved.");
        onDone();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-2 gap-3 rounded-lg border border-blue-200 bg-blue-50/40 p-3 sm:grid-cols-5"
    >
      <FormField label="Value" error={errors.value?.message} className="sm:col-span-1">
        <Input type="number" {...register("value", { valueAsNumber: true })} />
      </FormField>
      <FormField label="Suffix" error={errors.suffix?.message} className="sm:col-span-1">
        <Input {...register("suffix")} placeholder="+" />
      </FormField>
      <FormField label="Label" required error={errors.label?.message} className="sm:col-span-2">
        <Input {...register("label")} placeholder="Projects Delivered" />
      </FormField>
      <FormField label="Order" error={errors.order?.message} className="sm:col-span-1">
        <Input type="number" {...register("order", { valueAsNumber: true })} />
      </FormField>
      <div className="col-span-2 flex items-end gap-2 sm:col-span-5">
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

function DeleteStat({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteStatisticAction(id);
      if (result.success) {
        toast.success("Statistic deleted.");
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
