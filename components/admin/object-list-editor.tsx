"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Input, Textarea } from "@/components/admin/ui/input";
import { AdminButton } from "@/components/admin/ui/button";

export interface ObjectListField {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  /** Spans both columns on wide screens. */
  wide?: boolean;
}

interface ObjectListEditorProps<T extends Record<string, string | undefined>> {
  value: T[];
  onChange: (value: T[]) => void;
  fields: ObjectListField[];
  addLabel: string;
  itemLabel: string;
}

/** Repeatable editor for small structured records (experience, education, projects, …). */
export function ObjectListEditor<T extends Record<string, string | undefined>>({
  value,
  onChange,
  fields,
  addLabel,
  itemLabel,
}: ObjectListEditorProps<T>) {
  function updateAt(i: number, key: string, next: string) {
    const copy = [...value];
    copy[i] = { ...copy[i], [key]: next } as T;
    onChange(copy);
  }

  function move(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= value.length) return;
    const copy = [...value];
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
    onChange(copy);
  }

  function add() {
    onChange([...value, Object.fromEntries(fields.map((f) => [f.key, ""])) as T]);
  }

  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {itemLabel} {i + 1}
            </span>
            <div className="flex gap-1">
              <AdminButton variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>
                <ArrowUp className="h-3.5 w-3.5" />
              </AdminButton>
              <AdminButton
                variant="ghost"
                size="icon"
                onClick={() => move(i, 1)}
                aria-label="Move down"
                disabled={i === value.length - 1}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </AdminButton>
              <AdminButton
                variant="ghost"
                size="icon"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`}
                className="text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </AdminButton>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {fields.map((f) => {
              const common = {
                value: item[f.key] ?? "",
                placeholder: f.placeholder ?? f.label + (f.required ? " *" : ""),
                "aria-label": `${itemLabel} ${i + 1} ${f.label}`,
              };
              return (
                <div key={f.key} className={f.wide || f.multiline ? "sm:col-span-2" : undefined}>
                  {f.multiline ? (
                    <Textarea rows={2} {...common} onChange={(e) => updateAt(i, f.key, e.target.value)} />
                  ) : (
                    <Input {...common} onChange={(e) => updateAt(i, f.key, e.target.value)} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <AdminButton variant="outline" size="sm" onClick={add}>
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </AdminButton>
    </div>
  );
}
