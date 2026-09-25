"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { gsap } from "@/components/animations/gsap-setup";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

interface NavLink {
  label: string;
  href: string;
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
}

export function MobileNav({ open, onClose, navLinks }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!panelRef.current || !linksRef.current) return;

    const ctx = gsap.context(() => {
      if (open) {
        gsap.fromTo(
          panelRef.current,
          { xPercent: 100 },
          { xPercent: 0, duration: 0.5, ease: "power3.out" },
        );
        gsap.fromTo(
          linksRef.current!.children,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, delay: 0.15, ease: "power3.out" },
        );
      }
    }, panelRef);

    return () => ctx.revert();
  }, [open]);

  function handleClose() {
    if (!panelRef.current) {
      onClose();
      return;
    }
    gsap.to(panelRef.current, {
      xPercent: 100,
      duration: 0.4,
      ease: "power3.in",
      onComplete: onClose,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 lg:hidden">
      <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-xs" onClick={handleClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-navy-900 px-6 py-6"
      >
        <div className="flex items-center justify-between">
          <Logo variant="light" size={40} />
          <button
            aria-label="Close menu"
            onClick={handleClose}
            className="p-2 text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div ref={linksRef} className="mt-10 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleClose}
              className="border-b border-white/10 py-4 text-xl font-medium text-slate-200 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-8">
          <Button href="/contact" variant="primary" size="lg" className="w-full" onClick={handleClose}>
            Start a Project
          </Button>
        </div>
      </div>
    </div>
  );
}
