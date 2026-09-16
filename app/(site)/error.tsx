"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <AlertTriangle className="h-8 w-8 text-blue-500" strokeWidth={1.5} />
      <h1 className="mt-4 font-display text-xl font-semibold text-navy-900">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        An unexpected error occurred while loading this page. You can try again, or head back home.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="border border-border px-5 py-2.5 text-sm font-medium text-navy-900 hover:bg-slate-50"
        >
          Try Again
        </button>
        <Button href="/" variant="primary" size="sm">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
