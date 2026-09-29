import { SectionWrapper } from "./section-wrapper";
import { Reveal } from "@/components/animations/reveal";
import { getIcon } from "@/lib/icons";
import type { WhyLeotechItem } from "@/lib/db/schema";

interface WhyLeotechProps {
  title: string;
  description: string | null;
  items: WhyLeotechItem[];
}

export function WhyLeotech({ title, description, items }: WhyLeotechProps) {
  if (items.length === 0) return null;

  return (
    <SectionWrapper index="06" label="Why LeoTech" title={title} description={description}>
      <Reveal stagger className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <div key={item.id} className="border-l-2 border-blue-500/30 pl-5">
              <Icon className="h-6 w-6 text-blue-500" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg font-semibold text-heading">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          );
        })}
      </Reveal>
    </SectionWrapper>
  );
}
