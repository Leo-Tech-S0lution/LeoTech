"use client";

import { useEffect } from "react";
import { Copy, Download, Printer, X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/button";
import { copyProfileUrl, downloadQr, openQrPrint, qrImageSrc } from "./qr-client";

export interface QrPreviewMember {
  id: string;
  name: string;
  position: string | null;
  employeeId: string | null;
  qrVersion: number;
  profileUrl: string;
}

interface QrPreviewDialogProps {
  member: QrPreviewMember | null;
  onClose: () => void;
}

/** Large QR preview laid out like the ID-card print, with download/print/copy actions. */
export function QrPreviewDialog({ member, onClose }: QrPreviewDialogProps) {
  useEffect(() => {
    if (!member) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [member, onClose]);

  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-preview-title"
        className="relative max-h-[95vh] w-full max-w-sm overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-heading"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-blue-600">Leo Tech Solution</p>
          <h2 id="qr-preview-title" className="mt-3 font-display text-lg font-semibold text-heading">
            {member.name}
          </h2>
          {member.position && <p className="text-sm text-slate-500">{member.position}</p>}
          {member.employeeId && <p className="mt-0.5 font-mono text-xs text-slate-400">{member.employeeId}</p>}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageSrc(member.id, "svg", member.qrVersion)}
            alt={`QR code linking to ${member.name}'s profile`}
            className="mx-auto mt-4 aspect-square w-full max-w-[260px] border border-slate-200"
          />

          <p className="mt-3 text-sm font-medium text-heading">Scan to view digital profile</p>
          <p className="mt-1 break-all font-mono text-[11px] text-slate-500">{member.profileUrl}</p>
          <p className="mt-2 text-[11px] text-slate-400">Version {member.qrVersion}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <AdminButton variant="outline" size="sm" onClick={() => downloadQr(member.id, "png")}>
            <Download className="h-3.5 w-3.5" /> PNG
          </AdminButton>
          <AdminButton variant="outline" size="sm" onClick={() => downloadQr(member.id, "svg")}>
            <Download className="h-3.5 w-3.5" /> SVG
          </AdminButton>
          <AdminButton variant="outline" size="sm" onClick={() => openQrPrint([member.id], "card")}>
            <Printer className="h-3.5 w-3.5" /> Print
          </AdminButton>
          <AdminButton variant="outline" size="sm" onClick={() => copyProfileUrl(member.profileUrl)}>
            <Copy className="h-3.5 w-3.5" /> Copy URL
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
