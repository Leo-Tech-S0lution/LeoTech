"use client";

import { Printer } from "lucide-react";

export function PrintToolbar({ count, layout }: { count: number; layout: "card" | "sheet" }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3 print:hidden">
      <div>
        <p className="text-sm font-semibold text-navy-900">
          {layout === "sheet" ? "A4 QR sheet" : "ID card QR print"} · {count} member{count === 1 ? "" : "s"}
        </p>
        <p className="text-xs text-slate-500">
          Print at 100% scale (disable “fit to page”) so cards keep their 54 × 85.6 mm size.
        </p>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}
