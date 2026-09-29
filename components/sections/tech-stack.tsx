import Image from "next/image";
import { SectionWrapper } from "./section-wrapper";
import { Reveal } from "@/components/animations/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import type { TechCategoryWithItems } from "@/lib/db/queries/technologies";

interface TechStackProps {
  title: string;
  description: string | null;
  categories: TechCategoryWithItems[];
}

export function TechStack({ title, description, categories }: TechStackProps) {
  const hasItems = categories.some((c) => c.items.length > 0);

  return (
    <SectionWrapper index="03" label="Technology Stack" title={title} description={description}>
      {!hasItems ? (
        <EmptyState message="Technologies will appear here once they're added from the admin dashboard." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories
            .filter((c) => c.items.length > 0)
            .map((cat) => (
              <Reveal
                key={cat.id}
                className="relative flex flex-col bg-white p-6 shadow-card transition-shadow duration-500 hover:shadow-glow-sm"
              >
                {/* Accent line in place of a border: primary blue fading out. */}
                <span
                  className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-blue-500 via-blue-400/60 to-transparent"
                  aria-hidden
                />
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    {cat.name}
                  </h3>
                  <span className="font-mono text-[11px] text-slate-500">
                    {String(cat.items.length).padStart(2, "0")}
                  </span>
                </div>
                <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-1">
                  {cat.items.map((item) => (
                    <li
                      key={item.id}
                      className="group -mx-2 flex items-center gap-3 px-2 py-2 text-sm text-slate-600 transition-colors duration-300 hover:bg-slate-50 hover:text-heading"
                    >
                      <TechLogo name={item.name} icon={item.icon} />
                      <span className="min-w-0 truncate">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
        </div>
      )}
    </SectionWrapper>
  );
}

/** Only real image URLs/paths are rendered — older rows may hold a plain icon key. */
function isImageUrl(icon: string | null): icon is string {
  return !!icon && (/^https?:\/\//i.test(icon) || icon.startsWith("/"));
}

/**
 * Logo in a soft grey circle on the white panel.
 * Falls back to the name's initials.
 */
function TechLogo({ name, icon }: { name: string; icon: string | null }) {
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-sm">
      {isImageUrl(icon) ? (
        <Image
          src={icon}
          alt={`${name} logo`}
          fill
          sizes="40px"
          // next/image's optimizer rejects SVG; serve SVG logos as-is.
          unoptimized={/\.svg(\?|#|$)/i.test(icon)}
          // Extra padding keeps logo corners inside the circle.
          className="object-contain p-2"
        />
      ) : (
        <span className="font-mono text-[11px] font-semibold uppercase text-heading" aria-hidden>
          {name.slice(0, 2)}
        </span>
      )}
    </span>
  );
}
