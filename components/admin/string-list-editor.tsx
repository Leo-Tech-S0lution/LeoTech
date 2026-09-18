"use client";

import { Plus, X, GripVertical } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { AdminButton } from "@/components/admin/ui/button";

interface StringListEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}

/** Repeatable single-line text input list, used for features/technologies/skills/arrays. */
export function StringListEditor({ value, onChange, placeholder, addLabel = "Add item" }: StringListEditorProps) {
  const items = value.length > 0 ? value : [];

  function updateAt(i: number, next: string) {
    const copy = [...items];
    copy[i] = next;
    onChange(copy);
  }

  function removeAt(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...items, ""]);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(e) => updateAt(i, e.target.value)}
            className="flex-1"
          />
          <AdminButton
            variant="ghost"
            size="icon"
            onClick={() => removeAt(i)}
            aria-label="Remove item"
            className="text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </AdminButton>
        </div>
      ))}
      <AdminButton variant="outline" size="sm" onClick={add}>
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </AdminButton>
    </div>
  );
}
