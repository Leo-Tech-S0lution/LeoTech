"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, ArrowUpRight } from "lucide-react";
import { gsap } from "@/components/animations/gsap-setup";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils/cn";
import { MobileNav } from "./mobile-nav";

export interface NavService {
  slug: string;
  title: string;
  icon: string | null;
}

export interface NavCourse {
  slug: string;
  title: string;
}

const SOLUTIONS = [
  { label: "AI & Machine Learning", href: "/solutions#ai-ml", icon: "ai" },
  { label: "IoT & Robotics", href: "/solutions#iot", icon: "iot" },
  { label: "Cloud Solutions", href: "/solutions#cloud", icon: "cloud" },
  { label: "Cybersecurity", href: "/solutions#security", icon: "security" },
  { label: "Networking", href: "/solutions#networking", icon: "network" },
  { label: "UI/UX Design", href: "/solutions#uiux", icon: "design" },
];

interface NavbarProps {
  services: NavService[];
  courses: NavCourse[];
}

export function Navbar({ services, courses }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menus when the route changes ("adjust state on prop change" during render).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    gsap.to(el, {
      // navy-900 (#050A24) / navy-700 (#1E2A5E) from the theme palette.
      backgroundColor: scrolled ? "rgba(5,10,36,0.9)" : "rgba(5,10,36,0)",
      backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
      borderColor: scrolled ? "rgba(30,42,94,1)" : "rgba(30,42,94,0)",
      duration: 0.5,
      ease: "power2.out",
    });
  }, [scrolled]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services", mega: "services" },
    { label: "Solutions", href: "/solutions", mega: "solutions" },
    { label: "Projects", href: "/projects" },
    { label: "Training", href: "/training", mega: "training" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        ref={barRef}
        className="fixed inset-x-0 top-0 z-50 border-b border-transparent"
        onMouseLeave={() => setOpenMenu(null)}
      >
        <nav className="container-tech flex h-20 items-center justify-between">
          <Logo variant="light" size={44} priority />

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <div key={link.href} className="relative">
                <Link
                  href={link.href}
                  onMouseEnter={() => setOpenMenu(link.mega ?? null)}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:text-white",
                    pathname === link.href && "text-white",
                  )}
                >
                  {link.label}
                  {link.mega && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <Button href="/contact" variant="primary" size="md">
              Start a Project
            </Button>
          </div>

          <button
            className="p-2 text-white lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>

        {/* Mega menus */}
        <MegaPanel open={openMenu === "services"}>
          <div className="grid grid-cols-3 gap-2">
            {services.slice(0, 9).map((s) => {
              const Icon = getIcon(s.icon);
              return (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="group flex items-start gap-3 border border-transparent p-3 transition-colors hover:border-blue-400/20 hover:bg-white/5"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span className="text-sm text-slate-200 group-hover:text-white">{s.title}</span>
                </Link>
              );
            })}
          </div>
          <MegaFooterLink href="/services" label="View all services" />
        </MegaPanel>

        <MegaPanel open={openMenu === "solutions"}>
          <div className="grid grid-cols-3 gap-2">
            {SOLUTIONS.map((s) => {
              const Icon = getIcon(s.icon);
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex items-start gap-3 border border-transparent p-3 transition-colors hover:border-blue-400/20 hover:bg-white/5"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span className="text-sm text-slate-200 group-hover:text-white">{s.label}</span>
                </Link>
              );
            })}
          </div>
          <MegaFooterLink href="/solutions" label="Explore all solutions" />
        </MegaPanel>

        <MegaPanel open={openMenu === "training"}>
          <div className="grid grid-cols-3 gap-2">
            {courses.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={`/training/${c.slug}`}
                className="border border-transparent p-3 text-sm text-slate-200 transition-colors hover:border-blue-400/20 hover:bg-white/5 hover:text-white"
              >
                {c.title}
              </Link>
            ))}
            <Link
              href="/internships"
              className="border border-transparent p-3 text-sm font-medium text-blue-400 transition-colors hover:border-blue-400/20 hover:bg-white/5"
            >
              Internship Programs →
            </Link>
          </div>
          <MegaFooterLink href="/training" label="View all courses" />
        </MegaPanel>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
      />
    </>
  );
}

function MegaPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-full hidden overflow-hidden border-b border-navy-700 bg-navy-900/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-technical lg:block",
        open ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0",
      )}
    >
      <div className="container-tech py-6">{children}</div>
    </div>
  );
}

function MegaFooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-4 inline-flex items-center gap-1.5 border-t border-navy-700 pt-4 text-xs font-medium uppercase tracking-wide text-blue-400 hover:text-blue-300"
    >
      {label}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
