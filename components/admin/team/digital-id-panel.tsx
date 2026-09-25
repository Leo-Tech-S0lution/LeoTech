"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, Printer, RefreshCw, ExternalLink } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/components/admin/toast";
import { regenerateQrAction } from "@/app/admin/(dashboard)/qr-management/actions";
import { copyProfileUrl, downloadQr, openQrPrint, qrImageSrc } from "./qr-client";

interface DigitalIdPanelProps {
  memberId: string;
  name: string;
  profileUrl: string;
  profilePath: string;
  qrEnabled: boolean;
  qrVersion: number;
  qrGeneratedAt: string | null;
  canManageQr: boolean;
}

/** "Digital ID / QR" section of the member editor. */
export function DigitalIdPanel({
  memberId,
  name,
  profileUrl,
  profilePath,
  qrEnabled,
  qrVersion,
  qrGeneratedAt,
  canManageQr,
}: DigitalIdPanelProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!qrEnabled) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
        QR is disabled for this member. Enable it above and save to generate the ID-card QR.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h3 className="font-display text-sm font-semibold text-navy-900">Digital ID / QR</h3>
      <div className="mt-3 flex flex-col gap-5 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImageSrc(memberId, "svg", qrVersion)}
          alt={`QR code for ${name}'s profile`}
          className="aspect-square w-40 shrink-0 self-center border border-slate-200 sm:self-start"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs text-slate-500">Profile URL</p>
            <p className="break-all font-mono text-sm text-navy-900">{profileUrl}</p>
          </div>
          <p className="text-xs text-slate-500">
            Version {qrVersion}
            {qrGeneratedAt ? ` · generated ${new Date(qrGeneratedAt).toLocaleDateString()}` : " · not generated yet"}
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminButton variant="outline" size="sm" onClick={() => copyProfileUrl(profileUrl)}>
              <Copy className="h-3.5 w-3.5" /> Copy URL
            </AdminButton>
            <AdminButton variant="outline" size="sm" onClick={() => downloadQr(memberId, "png")}>
              <Download className="h-3.5 w-3.5" /> PNG
            </AdminButton>
            <AdminButton variant="outline" size="sm" onClick={() => downloadQr(memberId, "svg")}>
              <Download className="h-3.5 w-3.5" /> SVG
            </AdminButton>
            <AdminButton variant="outline" size="sm" onClick={() => openQrPrint([memberId], "card")}>
              <Printer className="h-3.5 w-3.5" /> Print QR
            </AdminButton>
            <AdminButton variant="ghost" size="sm" href={profilePath} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" /> Preview profile
            </AdminButton>
            {canManageQr ? (
              <AdminButton variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </AdminButton>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Regenerate QR?"
        description="Regenerating the QR does not change the profile URL — already printed cards keep working. It only issues a fresh file (new version number)."
        confirmLabel="Regenerate"
        destructive={false}
        pending={isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            const result = await regenerateQrAction(memberId);
            if (result.success) {
              toast.success("QR regenerated.");
              setConfirmOpen(false);
              router.refresh();
            } else {
              toast.error(result.error);
            }
          })
        }
      />
    </div>
  );
}
