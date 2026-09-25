import "server-only";
import QRCode from "qrcode";
import sharp from "sharp";
import { LOGO_MARK_VIEWBOX, LOGO_SVG_INNER } from "./qr-logo";

/**
 * Branded ID-card QR: rounded modules in a LeoTech navy→blue gradient, custom
 * finder "eyes", and the LeoTech mark on a white badge in the centre.
 *
 * Scan reliability guards:
 * - error correction "H" (≈30% recoverable); the logo badge covers only ~5% of the symbol
 * - every module colour stays dark (≤ #0451ae) on pure white for strong contrast
 * - 4-module white quiet zone (ISO minimum)
 * The payload is always just the public profile URL.
 */

const MARGIN = 4;
const NAVY = "#000054";
const BLUE_DARK = "#0451ae";
const BLUE = "#1373e9";
/** Fraction of the symbol width reserved for the centre logo badge. */
const LOGO_RATIO = 0.22;

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  return (
    `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 -${r},${r}` +
    `h-${w - 2 * r}a${r},${r} 0 0 1 -${r},-${r}v-${h - 2 * r}a${r},${r} 0 0 1 ${r},-${r}z`
  );
}

export async function qrSvg(url: string, options: { size?: number; idSuffix?: string } = {}): Promise<string> {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const total = n + MARGIN * 2;
  const uid = options.idSuffix ?? Math.random().toString(36).slice(2, 8);

  // Centre logo zone, in module coordinates (odd size so it stays centred).
  let logo = Math.round(n * LOGO_RATIO);
  if (logo % 2 === 0) logo += 1;
  const logoStart = Math.floor((n - logo) / 2);
  const logoEnd = logoStart + logo;

  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const inLogo = (r: number, c: number) => r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd;

  const dots: string[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.modules.get(r, c) || inFinder(r, c) || inLogo(r, c)) continue;
      dots.push(roundedRectPath(c + MARGIN + 0.03, r + MARGIN + 0.03, 0.94, 0.94, 0.26));
    }
  }

  const eye = (row: number, col: number) => {
    const x = col + MARGIN;
    const y = row + MARGIN;
    return (
      `<path fill-rule="evenodd" fill="url(#qr-eye-${uid})" d="${roundedRectPath(x, y, 7, 7, 1.5)}${roundedRectPath(x + 1, y + 1, 5, 5, 0.9)}"/>` +
      `<path fill="url(#qr-eye-in-${uid})" d="${roundedRectPath(x + 2, y + 2, 3, 3, 0.6)}"/>`
    );
  };

  const badge = logoStart + MARGIN;
  const pad = 0.55;
  const size = options.size;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}"${size ? ` width="${size}" height="${size}"` : ""} shape-rendering="geometricPrecision">`,
    `<defs>`,
    `<linearGradient id="qr-body-${uid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${total}" y2="${total}">`,
    `<stop offset="0" stop-color="${NAVY}"/><stop offset="1" stop-color="${BLUE_DARK}"/></linearGradient>`,
    `<linearGradient id="qr-eye-${uid}" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0" stop-color="${NAVY}"/><stop offset="1" stop-color="#0a2f66"/></linearGradient>`,
    `<linearGradient id="qr-eye-in-${uid}" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0" stop-color="${BLUE}"/><stop offset="1" stop-color="${BLUE_DARK}"/></linearGradient>`,
    `</defs>`,
    `<rect width="${total}" height="${total}" fill="#ffffff"/>`,
    `<path fill="url(#qr-body-${uid})" d="${dots.join("")}"/>`,
    eye(0, 0),
    eye(0, n - 7),
    eye(n - 7, 0),
    `<path fill="#ffffff" stroke="${BLUE}" stroke-width="0.18" d="${roundedRectPath(badge + 0.2, badge + 0.2, logo - 0.4, logo - 0.4, 1.2)}"/>`,
    `<svg x="${badge + pad}" y="${badge + pad}" width="${logo - pad * 2}" height="${logo - pad * 2}" viewBox="${LOGO_MARK_VIEWBOX}">${LOGO_SVG_INNER}</svg>`,
    `</svg>`,
  ].join("");
}

/** High-resolution PNG (default 1024px) — crisp at ID-card print sizes. */
export async function qrPng(url: string, size = 1024): Promise<Buffer> {
  const width = Math.min(Math.max(Math.round(size), 128), 4096);
  const svg = await qrSvg(url, { size: width, idSuffix: "png" });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
