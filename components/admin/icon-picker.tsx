"use client";

import { ICONS, getIcon } from "@/lib/icons";
import { Select } from "@/components/admin/ui/input";

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
}

/** Select populated from the shared ICONS map, with a live preview of the chosen icon. */
export function IconPicker({ value, onChange, id, name }: IconPickerProps) {
  const PreviewIcon = getIcon(value);
  const keys = Object.keys(ICONS);

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-navy-900">
        <PreviewIcon className="h-4 w-4" />
      </div>
      <Select id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} className="flex-1">
        {keys.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </Select>
    </div>
  );
}
