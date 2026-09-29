"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Newspaper,
  Briefcase,
  GraduationCap,
  Users,
  Star,
  UserPlus,
  Mail,
  ImageIcon,
  Search,
  Settings,
  ShieldCheck,
  QrCode,
  ChevronDown,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";
import { logoutAction } from "@/app/admin/actions";

interface NavLeaf {
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavLeaf[];
}

interface NavSingle {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

type NavItem = NavGroup | NavSingle;

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Website",
    icon: Globe,
    children: [
      { label: "Homepage", href: "/admin/website/homepage" },
      { label: "Hero", href: "/admin/website/hero" },
      { label: "About", href: "/admin/website/about" },
      { label: "Services", href: "/admin/services" },
      { label: "Technologies", href: "/admin/website/technologies" },
      { label: "Projects", href: "/admin/projects" },
      { label: "Training", href: "/admin/training/courses" },
      { label: "Testimonials", href: "/admin/testimonials" },
      { label: "Team", href: "/admin/team" },
      { label: "FAQ", href: "/admin/website/faq" },
      { label: "Contact", href: "/admin/messages" },
    ],
  },
  {
    label: "Blog",
    icon: Newspaper,
    children: [
      { label: "Posts", href: "/admin/blog/posts" },
      { label: "Categories", href: "/admin/blog/categories" },
    ],
  },
  { label: "Projects", href: "/admin/projects", icon: Briefcase },
  {
    label: "Training",
    icon: GraduationCap,
    children: [
      { label: "Courses", href: "/admin/training/courses" },
      { label: "Internships", href: "/admin/training/internships" },
    ],
  },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "QR Management", href: "/admin/qr-management", icon: QrCode },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star },
  { label: "Careers", href: "/admin/careers", icon: UserPlus },
  { label: "Messages / Inquiries", href: "/admin/messages", icon: Mail },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon },
  {
    label: "SEO",
    icon: Search,
    children: [
      { label: "Page SEO", href: "/admin/seo" },
      { label: "SEO Health", href: "/admin/seo/health" },
    ],
  },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
  { label: "Users / Admin", href: "/admin/users", icon: ShieldCheck },
];

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

function isActiveHref(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <Logo variant="dark" size={32} href="/admin" />
          <button
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-heading lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV.map((item) =>
            isGroup(item) ? (
              <NavGroupItem key={item.label} item={item} pathname={pathname} />
            ) : (
              <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} pathname={pathname} />
            ),
          )}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  nested = false,
}: {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  pathname: string;
  nested?: boolean;
}) {
  const active = isActiveHref(pathname, href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        nested ? "pl-9 text-[13px]" : "",
        active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-heading",
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavGroupItem({ item, pathname }: { item: NavGroup; icon?: never; pathname: string }) {
  const groupActive = item.children.some((c) => isActiveHref(pathname, c.href));
  const [open, setOpen] = useState(groupActive);
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          groupActive ? "text-heading" : "text-slate-600 hover:bg-slate-50 hover:text-heading",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="mt-0.5 space-y-0.5">
          {item.children.map((child) => (
            <NavLink key={child.href} href={child.href} label={child.label} pathname={pathname} nested />
          ))}
        </div>
      ) : null}
    </div>
  );
}
