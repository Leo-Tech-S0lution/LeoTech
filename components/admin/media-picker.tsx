"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ImagePlus, Upload, X, Check, Loader2 } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { toast } from "@/components/admin/toast";
import { listMediaAction, uploadMediaAction } from "@/app/admin/(dashboard)/media/actions";
import type { Media } from "@/lib/db/schema";

interface MediaPickerProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
}

/**
 * Reusable image field used by every image reference across the admin (services, projects,
 * team, testimonials, training, blog, hero slides, site settings' OG image, ...). Lets the
 * admin pick an existing media item or upload a new one inline. Never hand-type a URL.
 */
export function MediaPicker({ value, onChange, label = "Image" }: MediaPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-slate-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <AdminButton type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            {value ? `Change ${label.toLowerCase()}` : `Choose ${label.toLowerCase()}`}
          </AdminButton>
          {value ? (
            <AdminButton
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-600"
              onClick={() => onChange("")}
            >
              Remove
            </AdminButton>
          ) : null}
        </div>
      </div>

      {open ? (
        <MediaPickerModal
          currentValue={value ?? null}
          onSelect={(url) => {
            onChange(url);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function MediaPickerModal({
  currentValue,
  onSelect,
  onClose,
}: {
  currentValue: string | null;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Media[] | null>(null);
  const [search, setSearch] = useState("");
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listMediaAction().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    startUpload(async () => {
      try {
        const result = await uploadMediaAction(formData);
        if (result.success) {
          setItems((prev) => (prev ? [result.data, ...prev] : [result.data]));
          onSelect(result.data.url);
          toast.success("Image uploaded.");
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Upload failed. The file may be too large (max 10MB).");
      }
    });
  }

  const filtered = (items ?? []).filter((m) =>
    m.filename.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-navy-900">Select image</h2>
          <AdminButton variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </AdminButton>
        </div>

        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
          <Input
            placeholder="Search media…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload new
          </AdminButton>
        </div>

        <div
          className="flex-1 overflow-y-auto p-5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          {items === null ? (
            <p className="py-10 text-center text-sm text-slate-400">Loading media…</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-16 text-sm text-slate-400">
              <ImagePlus className="h-6 w-6 text-slate-300" />
              No media found. Drag and drop an image here, or use Upload new.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {filtered.map((item) => {
                const selected = item.url === currentValue;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.url)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border ${
                      selected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                    } bg-slate-50`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.altText ?? item.filename}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    {selected ? (
                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    ) : null}
                    <span className="absolute inset-x-0 bottom-0 truncate bg-navy-950/60 px-1.5 py-1 text-left text-[10px] text-white opacity-0 group-hover:opacity-100">
                      {item.filename}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
