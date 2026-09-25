import "server-only";
import QRCode from "qrcode";

/**
 * QR rendering for ID cards. Plain black-on-white, error correction "H" and a
 * 4-module quiet zone (the ISO minimum) — scan reliability over decoration.
 * The payload is always just the public profile URL.
 */
const BASE_OPTIONS = {
  errorCorrectionLevel: "H" as const,
  margin: 4,
  color: { dark: "#000000", light: "#ffffff" },
};

export async function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...BASE_OPTIONS, type: "svg" });
}

/** High-resolution PNG. 1024px prints crisply at ID-card sizes (~2–3 cm) well above 300 dpi. */
export async function qrPng(url: string, size = 1024): Promise<Buffer> {
  const width = Math.min(Math.max(Math.round(size), 128), 4096);
  return QRCode.toBuffer(url, { ...BASE_OPTIONS, type: "png", width });
}
