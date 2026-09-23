"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Copy, Loader2, ImageIcon } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { toast } from "@/components/admin/toast";
import { uploadMediaAction, deleteMediaAction } from "@/app/admin/(dashboard)/media/actions";
import type { Media } from "@/lib/db/schema";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ initialItems }: { initialItems: Media[] }) {
  const [items, setItems] = useState(initialItems);
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const formData = new FormData();
      formData.append("file", file);
      startUpload(async () => {
        try {
          const result = await uploadMediaAction(formData);
          if (result.success) {
            setItems((prev) => [result.data, ...prev]);
            toast.success(`${file.name} uploaded.`);
          } else {
            toast.error(result.error);
          }
        } catch {
          toast.error(`${file.name}: upload failed. The file may be too large (max 10MB).`);
        }
      });
    });
  }

  function copyUrl(url: string) {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("URL copied to clipboard."))
      .catch(() => toast.error("Could not copy URL."));
  }

  return (
    <div>
      <div
        className="mb-6 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="h-6 w-6 text-slate-300" />
        <p className="text-sm text-slate-500">Drag and drop images here, or</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <AdminButton size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Browse files
        </AdminButton>
        <p className="text-xs text-slate-400">JPEG, PNG, WebP, GIF, SVG — up to 10MB each</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">
          <ImageIcon className="h-6 w-6 text-slate-300" />
          No media uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="aspect-square bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.altText ?? item.filename} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-navy-900" title={item.filename}>
                  {item.filename}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                  {formatBytes(item.size)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    className="px-1.5 text-slate-500"
                    onClick={() => copyUrl(item.url)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy URL
                  </AdminButton>
                  <DeleteButton
                    itemLabel={item.filename}
                    action={() => deleteMediaAction(item.id)}
                    onDeleted={() => setItems((prev) => prev.filter((m) => m.id !== item.id))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
