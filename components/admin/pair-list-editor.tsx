"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { AdminButton } from "@/components/admin/ui/button";

export interface LabelUrlPair {
  label: string;
  url: string;
}

interface PairListEditorProps {
  value: LabelUrlPair[];
  onChange: (value: LabelUrlPair[]) => void;
  labelPlaceholder?: string;
  urlPlaceholder?: string;
  addLabel?: string;
}

/** Repeatable {label, url} pair editor, used for social links and similar structures. */
export function PairListEditor({
  value,
  onChange,
  labelPlaceholder = "Label (e.g. LinkedIn)",
  urlPlaceholder = "https://…",
  addLabel = "Add link",
}: PairListEditorProps) {
  const items = value.length > 0 ? value : [];

  function updateAt(i: number, next: Partial<LabelUrlPair>) {
    const copy = [...items];
    copy[i] = { ...copy[i], ...next } as LabelUrlPair;
    onChange(copy);
  }

  function removeAt(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...items, { label: "", url: "" }]);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item.label}
            placeholder={labelPlaceholder}
            onChange={(e) => updateAt(i, { label: e.target.value })}
            className="w-2/5"
          />
          <Input
            value={item.url}
            placeholder={urlPlaceholder}
            onChange={(e) => updateAt(i, { url: e.target.value })}
            className="flex-1"
          />
          <AdminButton
            variant="ghost"
            size="icon"
            onClick={() => removeAt(i)}
            aria-label="Remove link"
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
