"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { AdminButton } from "@/components/admin/ui/button";
import { StringListEditor } from "@/components/admin/string-list-editor";

export interface CurriculumModule {
  title: string;
  items: string[];
}

interface CurriculumEditorProps {
  value: CurriculumModule[];
  onChange: (value: CurriculumModule[]) => void;
}

/**
 * Nested repeatable editor for the course curriculum: a list of modules, each with a title
 * and its own repeatable list of item strings (reusing StringListEditor per module).
 */
export function CurriculumEditor({ value, onChange }: CurriculumEditorProps) {
  const modules = value ?? [];

  function updateModule(i: number, next: Partial<CurriculumModule>) {
    const copy = [...modules];
    copy[i] = { ...(copy[i] ?? { title: "", items: [] }), ...next };
    onChange(copy);
  }

  function removeModule(i: number) {
    onChange(modules.filter((_, idx) => idx !== i));
  }

  function addModule() {
    onChange([...modules, { title: "", items: [] }]);
  }

  return (
    <div className="space-y-4">
      {modules.map((mod, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
            <Input
              value={mod.title}
              placeholder="Module title"
              onChange={(e) => updateModule(i, { title: e.target.value })}
              className="flex-1"
            />
            <AdminButton
              variant="ghost"
              size="icon"
              onClick={() => removeModule(i)}
              aria-label="Remove module"
              className="text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </AdminButton>
          </div>
          <div className="pl-6">
            <StringListEditor
              value={mod.items ?? []}
              onChange={(items) => updateModule(i, { items })}
              placeholder="Module item"
              addLabel="Add item"
            />
          </div>
        </div>
      ))}
      <AdminButton variant="outline" size="sm" onClick={addModule}>
        <Plus className="h-3.5 w-3.5" />
        Add module
      </AdminButton>
    </div>
  );
}
