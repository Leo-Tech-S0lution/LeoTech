/**
 * Coarse user-agent classification for profile analytics. Deliberately lossy:
 * we keep only device class / browser family / OS family, never the raw UA.
 */

const BOT_RE =
  /bot|crawler|spider|crawling|slurp|facebookexternalhit|whatsapp|telegrambot|preview|headless|lighthouse|pingdom|monitor|curl|wget|python|httpclient|go-http|axios|node-fetch/i;

export function isBot(ua: string): boolean {
  return !ua || BOT_RE.test(ua);
}

export function parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
  const deviceType = /ipad|tablet|(android(?!.*mobile))/i.test(ua)
    ? "tablet"
    : /mobi|iphone|ipod|android/i.test(ua)
      ? "mobile"
      : "desktop";

  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : /chrome|crios/i.test(ua)
            ? "Chrome"
            : /safari/i.test(ua)
              ? "Safari"
              : "Other";

  const os = /windows/i.test(ua)
    ? "Windows"
    : /iphone|ipad|ipod/i.test(ua)
      ? "iOS"
      : /android/i.test(ua)
        ? "Android"
        : /mac os x|macintosh/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";

  return { deviceType, browser, os };
}

/** Referrer hostname only, or null. */
export function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.slice(0, 255) || null;
  } catch {
    return null;
  }
}
