import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { Linkedin, Twitter, Github } from "@/components/ui/brand-icons";
import { Reveal } from "@/components/animations/reveal";
import { profilePath } from "@/lib/team/profile";
import type { TeamMember } from "@/lib/db/schema";

const SOCIAL_ICONS: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  github: Github,
};

export function TeamGrid({ members, showDepartment = false }: { members: TeamMember[]; showDepartment?: boolean }) {
  return (
    <Reveal stagger className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((member) => (
        <article key={member.id} className="group relative flex flex-col overflow-hidden border border-border">
          <div className="relative aspect-3/4 overflow-hidden bg-slate-100">
            {member.image ? (
              <Image
                src={member.image}
                alt={`${member.name}${member.position ? `, ${member.position}` : ""} at Leo Tech Solution`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 ease-technical group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-4xl font-bold text-slate-300">
                {member.name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 flex items-end bg-linear-to-t from-navy-900/90 via-navy-900/0 to-navy-900/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {member.socialLinks && member.socialLinks.length > 0 && (
                <div className="flex gap-2 p-4">
                  {member.socialLinks.map((s) => {
                    const Icon = SOCIAL_ICONS[s.label.toLowerCase()] ?? ArrowUpRight;
                    return (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on ${s.label}`}
                        className="flex h-7 w-7 items-center justify-center border border-white/20 text-white hover:border-blue-400"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-1 flex-col p-3">
            <h3 className="flex items-center gap-1 font-medium text-navy-900">
              <Link href={profilePath(member.slug)} className="hover:text-blue-600">
                {member.name}
              </Link>
              {member.isVerified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" aria-label="Verified team member" />
              )}
            </h3>
            <p className="text-xs text-slate-500">{member.position}</p>
            {showDepartment && member.department && (
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400">{member.department}</p>
            )}
            {member.bio && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{member.bio}</p>}
            <Link
              href={profilePath(member.slug)}
              className="mt-auto inline-flex items-center gap-1 pt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-blue-600 hover:text-blue-700"
              aria-label={`View profile of ${member.name}`}
            >
              View Profile
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </article>
      ))}
    </Reveal>
  );
}
