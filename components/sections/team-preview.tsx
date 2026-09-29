import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Linkedin, Twitter, Github } from "@/components/ui/brand-icons";
import { SectionWrapper } from "./section-wrapper";
import { Reveal } from "@/components/animations/reveal";
import { profilePath } from "@/lib/team/profile";
import type { TeamMember } from "@/lib/db/schema";

const SOCIAL_ICONS: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  github: Github,
};

interface TeamPreviewProps {
  title: string;
  description: string | null;
  members: TeamMember[];
}

export function TeamPreview({ title, description, members }: TeamPreviewProps) {
  if (members.length === 0) return null;

  return (
    <SectionWrapper index="09" label="Our Team" title={title} description={description}>
      <Reveal stagger className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {members.slice(0, 8).map((member) => (
          <div key={member.id} className="group relative overflow-hidden border border-border">
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
                    {member.socialLinks.map((s, i) => {
                      const Icon = SOCIAL_ICONS[s.label.toLowerCase()] ?? ArrowUpRight;
                      return (
                        <a
                          key={`${s.url}-${i}`}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
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
            <div className="p-3">
              <p className="font-medium text-heading">
                <Link href={profilePath(member.slug)} className="hover:text-blue-600">
                  {member.name}
                </Link>
              </p>
              <p className="text-xs text-slate-500">{member.position}</p>
            </div>
          </div>
        ))}
      </Reveal>

      <div className="mt-10 text-center">
        <Link
          href="/team"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700"
        >
          Meet the Full Team
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
