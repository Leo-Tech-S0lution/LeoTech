"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

interface AdminShellProps {
  userName: string;
  userRole: string;
  children: React.ReactNode;
}

export function AdminShell({ userName, userRole, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar userName={userName} userRole={userRole} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
