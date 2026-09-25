"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ShareProfileButtonProps {
  name: string;
  position: string | null;
  organization: string;
  url: string;
  className?: string;
}

/** Web Share API with a copy-URL fallback for browsers that don't support it. */
export function ShareProfileButton({ name, position, organization, url, className }: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = [name, position, organization].filter(Boolean).join("\n");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${name} | ${organization}`, text, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this profile URL:", url);
    }
  }

  return (
    <button type="button" onClick={handleShare} className={cn(className)} aria-live="polite">
      {copied ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
      <span>{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
