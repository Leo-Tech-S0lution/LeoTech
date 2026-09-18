"use client";

import { X } from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";

interface GalleryPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Multi-image field for the project gallery. Renders the current images as a thumbnail
 * grid with per-image remove buttons, and reuses the shared MediaPicker (kept at a local
 * `value=null` so its own trigger always reads "Choose image") purely for its picker
 * modal — each selection is appended to the gallery array instead of replacing a single
 * field.
 */
export function GalleryPicker({ value, onChange }: GalleryPickerProps) {
  const images = value ?? [];

  function addImage(url: string) {
    if (!url || images.includes(url)) return;
    onChange([...images, url]);
  }

  function removeAt(i: number) {
    onChange(images.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy-950/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <MediaPicker value={null} onChange={addImage} label="Gallery image" />
    </div>
  );
}
