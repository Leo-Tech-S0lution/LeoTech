"use client";

import Link from "next/link";
import { Menu, ExternalLink } from "lucide-react";

interface TopbarProps {
  userName: string;
  userRole: string;
  onOpenMobile: () => void;
}

export function Topbar({ userName, userRole, onOpenMobile }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm sm:px-6">
      <button
        onClick={onOpenMobile}
        className="text-slate-500 hover:text-navy-900 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600"
        >
          View site
          <ExternalLink className="h-3 w-3" />
        </Link>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium leading-tight text-navy-900">{userName}</p>
            <p className="text-[11px] capitalize leading-tight text-slate-400">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
