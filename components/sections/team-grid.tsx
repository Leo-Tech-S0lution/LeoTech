import Image from "next/image";
import { Linkedin, Twitter, Github, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import type { TeamMember } from "@/lib/db/schema";

const SOCIAL_ICONS: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  github: Github,
};

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <Reveal stagger className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((member) => (
        <div key={member.id} className="group relative overflow-hidden border border-border">
          <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-500 ease-technical group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-4xl font-bold text-slate-300">
                {member.name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-900/90 via-navy-900/0 to-navy-900/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
            <p className="font-medium text-navy-900">{member.name}</p>
            <p className="text-xs text-slate-500">{member.position}</p>
            {member.bio && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{member.bio}</p>}
          </div>
        </div>
      ))}
    </Reveal>
  );
}
