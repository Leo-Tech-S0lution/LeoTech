import slugify from "slugify";

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
