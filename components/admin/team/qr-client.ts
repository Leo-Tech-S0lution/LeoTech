"use client";

import { toast } from "@/components/admin/toast";

export type QrFormat = "png" | "svg";

export function qrImageSrc(memberId: string, format: QrFormat = "svg", version?: number): string {
  return `/api/team/${memberId}/qr?format=${format}${version ? `&v=${version}` : ""}`;
}

/** Triggers a browser download of a member's QR (served by the admin-only QR API). */
export function downloadQr(memberId: string, format: QrFormat) {
  const a = document.createElement("a");
  a.href = `/api/team/${memberId}/qr?format=${format}&download=1`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Downloads several QR files one after another (browsers throttle simultaneous downloads). */
export async function downloadManyQr(memberIds: string[], format: QrFormat) {
  for (const id of memberIds) {
    downloadQr(id, format);
    await new Promise((r) => setTimeout(r, 400));
  }
}

export function openQrPrint(memberIds: string[], layout: "card" | "sheet") {
  window.open(`/admin/qr-print?layout=${layout}&ids=${memberIds.join(",")}`, "_blank", "noopener");
}

export async function copyProfileUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Profile URL copied.");
  } catch {
    toast.error("Could not copy — please copy the URL manually.");
  }
}
