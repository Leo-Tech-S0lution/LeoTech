import Image from "next/image";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { after } from "next/server";
import type { Metadata } from "next";
import {
  BadgeCheck,
  Phone,
  Mail,
  MessageCircle,
  UserPlus,
  MapPin,
  Building2,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { TechBackground } from "@/components/patterns/tech-background";
import { Button } from "@/components/ui/button";
import { ShareProfileButton } from "@/components/team/share-profile-button";
import { recordProfileView, resolveProfileSlug } from "@/lib/db/queries/team";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { profilePath, profileUrl, telHref, whatsappHref } from "@/lib/team/profile";
import { isBot, parseUserAgent, referrerHost } from "@/lib/team/user-agent";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import type { TeamMember } from "@/lib/db/schema";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

const SOCIAL_ICONS: Record<string, typeof Linkedin> = {
  linkedin: Linkedin,
  github: Github,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  x: Twitter,
  website: Globe,
  portfolio: Globe,
};

function metaDescription(m: TeamMember, org: string): string {
  const role = m.position ? `${m.position} at ${org}` : `a member of the ${org} team`;
  const full = m.bio
    ? `Professional profile of ${m.name}, ${role}. ${m.bio}`
    : `Learn more about ${m.name}, ${role}, including their professional background, skills, experience and projects.`;
  return full.length > 160 ? `${full.slice(0, 157).trimEnd()}…` : full;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const lookup = await resolveProfileSlug(slug);
  if (lookup.kind !== "found") return { title: "Profile Not Found", robots: { index: false } };

  const m = lookup.member;
  const settings = await getSiteSettings();
  const org = settings.companyName;

  if (!m.isActive) {
    return { title: "Profile Unavailable", robots: { index: false, follow: true } };
  }

  const title = [m.name, m.position, org].filter(Boolean).join(" | ");
  const description = metaDescription(m, org);
  const image = m.image ?? settings.defaultOgImage ?? "/brand/leotech-logo.svg";
  const canonical = profilePath(m.slug);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    // Unlisted (private) profiles still work from the ID-card QR but stay out of search results.
    robots: m.published ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonical,
      siteName: org,
      images: [{ url: image, alt: `${m.name}${m.position ? `, ${m.position}` : ""} at ${org}` }],
      firstName: m.firstName ?? undefined,
      lastName: m.lastName ?? undefined,
    },
    twitter: { card: "summary", title, description, images: [image] },
  };
}

/** Logs an anonymous view after the response is sent. Skips bots and signed-in admins. */
async function logView(memberId: string) {
  const [h, c] = await Promise.all([headers(), cookies()]);
  const ua = h.get("user-agent") ?? "";
  if (isBot(ua) || c.has("leotech_admin_session") || h.get("purpose") === "prefetch") return;
  const referrer = referrerHost(h.get("referer"));
  after(async () => {
    try {
      await recordProfileView({ teamMemberId: memberId, ...parseUserAgent(ua), referrer });
    } catch (err) {
      console.error("[team] failed to record profile view:", err);
    }
  });
}

export default async function TeamProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const lookup = await resolveProfileSlug(slug);

  if (lookup.kind === "redirect") permanentRedirect(profilePath(lookup.slug));
  if (lookup.kind === "missing") notFound();

  const m = lookup.member;
  const settings = await getSiteSettings();
  const org = settings.companyName;

  if (!m.isActive) return <ProfileUnavailable />;

  await logView(m.id);

  const url = profileUrl(m.slug);
  const siteUrl = getSiteUrl();
  const socials = (m.socialLinks ?? []).filter((s) => /^https?:\/\//i.test(s.url));
  const hasDetails = Boolean(
    m.biography ||
      m.bio ||
      m.skills?.length ||
      m.experience?.length ||
      m.education?.length ||
      m.projects?.length ||
      m.certifications?.length,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    dateModified: m.updatedAt.toISOString(),
    mainEntity: {
      "@type": "Person",
      name: m.name,
      jobTitle: m.position ?? undefined,
      description: m.bio ?? undefined,
      image: m.image ? absoluteUrl(m.image) : undefined,
      url,
      email: m.email ?? undefined,
      telephone: m.phone ?? undefined,
      knowsAbout: m.skills?.length ? m.skills : undefined,
      sameAs: socials.length ? socials.map((s) => s.url) : undefined,
      worksFor: { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: org, url: siteUrl },
    },
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: `${siteUrl}/` },
    { name: "Team", url: `${siteUrl}/team` },
    { name: m.name, url },
  ]);

  const actionClass =
    "flex min-h-[48px] flex-col items-center justify-center gap-1 border border-white/15 bg-white/5 px-2 py-2.5 text-[11px] font-medium uppercase tracking-wide text-white transition-colors hover:border-blue-400/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:flex-row sm:gap-2 sm:px-4 sm:text-xs";

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* First viewport: photo, verification, name, role and contact actions — no reveal animations. */}
      <section className="relative overflow-hidden bg-navy-900 pb-10 pt-28 lg:pb-16 lg:pt-36">
        {m.coverImage ? (
          <Image src={m.coverImage} alt="" fill priority className="object-cover opacity-25" sizes="100vw" />
        ) : null}
        <TechBackground type="network" dark className="opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 to-navy-900" />

        <div className="container-tech relative">
          <nav aria-label="Breadcrumb" className="mb-6 hidden sm:block">
            <ol className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
              <li>
                <Link href="/team" className="hover:text-white">Team</Link>
              </li>
              <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
              <li aria-current="page" className="truncate text-blue-400">{m.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:gap-8 sm:text-left">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden border-2 border-blue-400/40 bg-navy-800 sm:h-40 sm:w-40">
              {m.image ? (
                <Image
                  src={m.image}
                  alt={`${m.name}${m.position ? `, ${m.position}` : ""} at ${org}`}
                  fill
                  priority
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-5xl font-bold text-slate-500">
                  {m.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="mt-5 min-w-0 sm:mt-0">
              {m.isVerified && (
                <p className="inline-flex items-center gap-1.5 border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  Verified {org} Team Member
                </p>
              )}
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">{m.name}</h1>
              {m.position && <p className="mt-2 text-lg text-blue-300">{m.position}</p>}
              <p className="mt-1 text-sm text-slate-400">
                {[m.department, org].filter(Boolean).join(" · ")}
              </p>
              {m.employeeId && (
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                  Employee ID: <span className="text-slate-300">{m.employeeId}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 grid auto-cols-fr grid-flow-col gap-2 sm:flex sm:flex-wrap">
            {m.phone && (
              <a href={telHref(m.phone)} className={actionClass} aria-label={`Call ${m.name}`}>
                <Phone className="h-4 w-4" aria-hidden />
                <span>Call</span>
              </a>
            )}
            {m.email && (
              <a href={`mailto:${m.email}`} className={actionClass} aria-label={`Email ${m.name}`}>
                <Mail className="h-4 w-4" aria-hidden />
                <span>Email</span>
              </a>
            )}
            {m.whatsapp && (
              <a
                href={whatsappHref(m.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={actionClass}
                aria-label={`Message ${m.name} on WhatsApp`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                <span>WhatsApp</span>
              </a>
            )}
            <ShareProfileButton name={m.name} position={m.position} organization={org} url={url} className={actionClass} />
            <a href={`${profilePath(m.slug)}/vcard`} className={actionClass} aria-label={`Save ${m.name} to contacts`}>
              <UserPlus className="h-4 w-4" aria-hidden />
              <span>Save</span>
            </a>
          </div>
        </div>
      </section>

      <div className="bg-white">
        <div
          className={
            hasDetails
              ? "container-tech grid grid-cols-1 gap-12 py-14 lg:grid-cols-[1fr_320px] lg:gap-16 lg:py-20"
              : "container-tech mx-auto max-w-xl py-10 lg:py-16"
          }
        >
          <div className={hasDetails ? "min-w-0 space-y-12" : "hidden"}>
            {(m.biography || m.bio) && (
              <ProfileSection title="About">
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">{m.biography || m.bio}</p>
              </ProfileSection>
            )}

            {m.skills && m.skills.length > 0 && (
              <ProfileSection title="Skills">
                <ul className="flex flex-wrap gap-2">
                  {m.skills.map((skill) => (
                    <li key={skill} className="border border-border bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700">
                      {skill}
                    </li>
                  ))}
                </ul>
              </ProfileSection>
            )}

            {m.experience && m.experience.length > 0 && (
              <ProfileSection title="Experience">
                <Timeline
                  items={m.experience.map((e) => ({
                    period: e.period,
                    title: e.role,
                    subtitle: e.organization,
                    description: e.description,
                  }))}
                />
              </ProfileSection>
            )}

            {m.education && m.education.length > 0 && (
              <ProfileSection title="Education">
                <Timeline
                  items={m.education.map((e) => ({
                    period: e.period,
                    title: e.degree,
                    subtitle: e.institution,
                    description: e.description,
                  }))}
                />
              </ProfileSection>
            )}

            {m.projects && m.projects.length > 0 && (
              <ProfileSection title="Projects">
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {m.projects.map((p) => (
                    <li key={p.name} className="border border-border p-4">
                      <p className="font-display font-semibold text-navy-900">
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blue-600">
                            {p.name}
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        ) : (
                          p.name
                        )}
                      </p>
                      {p.description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.description}</p>}
                    </li>
                  ))}
                </ul>
              </ProfileSection>
            )}

            {m.certifications && m.certifications.length > 0 && (
              <ProfileSection title="Certifications">
                <ul className="divide-y divide-border border-y border-border">
                  {m.certifications.map((c) => (
                    <li key={c.name} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                      <div>
                        <p className="font-medium text-navy-900">
                          {c.url ? (
                            <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                              {c.name}
                            </a>
                          ) : (
                            c.name
                          )}
                        </p>
                        {c.issuer && <p className="text-sm text-slate-500">{c.issuer}</p>}
                      </div>
                      {c.year && <span className="font-mono text-xs text-slate-400">{c.year}</span>}
                    </li>
                  ))}
                </ul>
              </ProfileSection>
            )}
          </div>

          <aside className="h-fit space-y-6 lg:sticky lg:top-28">
            <div className="border border-border bg-slate-50 p-6">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {m.email && (
                  <li className="flex items-start gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                    <a href={`mailto:${m.email}`} className="break-all hover:text-blue-600">{m.email}</a>
                  </li>
                )}
                {m.phone && (
                  <li className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                    <a href={telHref(m.phone)} className="hover:text-blue-600">{m.phone}</a>
                  </li>
                )}
                {m.location && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                    {m.location}
                  </li>
                )}
                <li className="flex items-start gap-2.5">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                  <Link href="/" className="hover:text-blue-600">{org}</Link>
                </li>
              </ul>

              {socials.length > 0 && (
                <>
                  <h2 className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Social</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {socials.map((s) => {
                      const Icon = SOCIAL_ICONS[s.label.toLowerCase()] ?? ArrowUpRight;
                      return (
                        <li key={s.url}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer me"
                            className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-blue-400 hover:text-blue-600"
                          >
                            <Icon className="h-3.5 w-3.5" aria-hidden />
                            {s.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              <a
                href={`${profilePath(m.slug)}/vcard`}
                className="clip-corner-sm mt-6 inline-flex w-full items-center justify-center gap-2 bg-blue-500 px-6 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-blue-600"
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                Save Contact
              </a>
            </div>

            <div className="border border-border p-6 text-sm text-slate-500">
              <p>
                {m.name} is part of the team at{" "}
                <Link href="/about" className="font-medium text-navy-900 hover:text-blue-600">{org}</Link>.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-[0.15em]">
                <Link href="/team" className="text-blue-600 hover:text-blue-700">Meet the team</Link>
                <Link href="/contact" className="text-blue-600 hover:text-blue-700">Contact us</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`section-${title.toLowerCase()}`}>
      <h2
        id={`section-${title.toLowerCase()}`}
        className="mb-5 border-b border-border pb-3 font-display text-xl font-semibold text-navy-900"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Timeline({
  items,
}: {
  items: { period?: string; title: string; subtitle: string; description?: string }[];
}) {
  return (
    <ol className="space-y-6 border-l-2 border-blue-500/30 pl-5">
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`}>
          {item.period && <p className="font-mono text-xs uppercase tracking-[0.15em] text-blue-600">{item.period}</p>}
          <p className="mt-1 font-display font-semibold text-navy-900">{item.title}</p>
          <p className="text-sm text-slate-500">{item.subtitle}</p>
          {item.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>}
        </li>
      ))}
    </ol>
  );
}

function ProfileUnavailable() {
  return (
    <section className="relative overflow-hidden bg-navy-900 pb-24 pt-36 text-center lg:pt-44">
      <TechBackground type="grid" dark className="opacity-50" />
      <div className="container-tech relative">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">Team Profile</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">Profile Unavailable</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-400">
          This LeoTech Solution digital profile is currently unavailable.
        </p>
        <div className="mt-8">
          <Button href="/" variant="primary" size="md">
            Visit LeoTech Solution
          </Button>
        </div>
      </div>
    </section>
  );
}
