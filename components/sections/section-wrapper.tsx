import { cn } from "@/lib/utils/cn";
import { SectionLabel } from "@/components/ui/section-label";
import { Reveal } from "@/components/animations/reveal";

interface SectionWrapperProps {
  index: string;
  label: string;
  title: string;
  description?: string | null;
  dark?: boolean;
  className?: string;
  children: React.ReactNode;
  headerAlign?: "left" | "center";
}

export function SectionWrapper({
  index,
  label,
  title,
  description,
  dark = false,
  className,
  children,
  headerAlign = "left",
}: SectionWrapperProps) {
  return (
    <section className={cn("relative py-20 lg:py-28", dark ? "bg-navy-900 text-white" : "bg-white", className)}>
      <div className="container-tech relative">
        <Reveal
          className={cn(
            "mb-12 lg:mb-16",
            headerAlign === "center" && "mx-auto max-w-2xl text-center",
          )}
        >
          <SectionLabel index={index} label={label} dark={dark} className={headerAlign === "center" ? "justify-center" : undefined} />
          <h2
            className={cn(
              "mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]",
              dark ? "text-white" : "text-navy-900",
            )}
          >
            {title}
          </h2>
          {description && (
            <p className={cn("mt-4 max-w-2xl text-base leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}>
              {description}
            </p>
          )}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
