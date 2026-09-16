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
    <SectionWrapper index="03" label="Technology Stack" title={title} description={description} dark>
      {!hasItems ? (
        <EmptyState
          message="Technologies will appear here once they're added from the admin dashboard."
          className="border-white/15 text-slate-500"
        />
      ) : (
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {categories
            .filter((c) => c.items.length > 0)
            .map((cat) => (
              <Reveal key={cat.id}>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  {cat.name}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {cat.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <span className="h-1 w-1 shrink-0 bg-blue-400" />
                      {item.name}
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
