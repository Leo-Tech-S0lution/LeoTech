import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Linkedin, Twitter, Github, Facebook, Instagram, Youtube } from "@/components/ui/brand-icons";
import { Logo } from "@/components/ui/logo";
import { TechBackground } from "@/components/patterns/tech-background";
import { getSiteSettings } from "@/lib/db/queries/settings";
import type { SiteSettings } from "@/lib/db/schema";

const SOCIAL_ICONS: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  github: Github,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

function socialIcon(label: string) {
  const key = label.toLowerCase();
  return SOCIAL_ICONS[key] ?? ArrowUpRight;
}

const COLUMNS = [
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Team", href: "/team" },
      { label: "Projects", href: "/projects" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "All Services", href: "/services" },
      { label: "Solutions", href: "/solutions" },
      { label: "AI & Machine Learning", href: "/solutions#ai-ml" },
      { label: "Cloud Solutions", href: "/solutions#cloud" },
      { label: "Cybersecurity", href: "/solutions#security" },
    ],
  },
  {
    heading: "Training",
    links: [
      { label: "All Courses", href: "/training" },
      { label: "Internships", href: "/internships" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

export async function Footer() {
  const settings: SiteSettings = await getSiteSettings();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-navy-900 text-slate-300">
      <TechBackground type="network" dark className="opacity-40" />

      <div className="container-tech relative py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="light" size={48} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
              {settings.footerDescription}
            </p>
            {settings.socialLinks && settings.socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {settings.socialLinks.map((s) => {
                  const Icon = socialIcon(s.label);
                  return (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center border border-white/10 text-slate-300 transition-colors hover:border-blue-400/40 hover:text-blue-400"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {col.heading}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Contact
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="hover:text-white">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="hover:text-white">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.address && <li>{settings.address}</li>}
              {settings.businessHours && <li className="text-slate-500">{settings.businessHours}</li>}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
