import { cn } from "@/lib/utils/cn";
import { NetworkPattern } from "./network-pattern";

export type TechBackgroundType =
  | "network"
  | "ai"
  | "iot"
  | "circuit"
  | "grid"
  | "blueprint"
  | "security"
  | "cloud";

interface TechBackgroundProps {
  type: TechBackgroundType;
  className?: string;
  dark?: boolean;
}

/**
 * Centralized technical-background engine. Pick the visual language for a
 * section by domain (`ai`, `iot`, `security`, ...) without hand-rolling SVG
 * or canvas markup at each call site.
 */
export function TechBackground({ type, className, dark = false }: TechBackgroundProps) {
  const base = "pointer-events-none absolute inset-0 overflow-hidden";

  switch (type) {
    case "network":
    case "ai":
    case "iot":
      return (
        <div className={cn(base, className)}>
          <NetworkPattern
            className="h-full w-full"
            nodeColor={dark ? "rgba(46,140,255,0.9)" : "rgba(19,115,233,0.55)"}
            lineColor={dark ? "rgba(46,140,255,0.18)" : "rgba(19,115,233,0.12)"}
            density={type === "iot" ? 1.2 : 0.9}
          />
        </div>
      );

    case "circuit":
      return (
        <div className={cn(base, className)}>
          <svg className="h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="circuit" width="120" height="120" patternUnits="userSpaceOnUse">
                <path
                  d="M0 60H40M40 60V20M40 20H100M100 20V0M40 60V100M40 100H120M60 60V120"
                  fill="none"
                  stroke={dark ? "rgba(120,150,220,0.18)" : "rgba(20,31,102,0.08)"}
                  strokeWidth="1"
                />
                <circle cx="40" cy="60" r="2.5" fill={dark ? "rgba(46,140,255,0.5)" : "rgba(19,115,233,0.35)"} />
                <circle cx="40" cy="20" r="2.5" fill={dark ? "rgba(46,140,255,0.35)" : "rgba(19,115,233,0.2)"} />
                <circle cx="100" cy="20" r="2.5" fill={dark ? "rgba(46,140,255,0.35)" : "rgba(19,115,233,0.2)"} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>
      );

    case "security":
      return (
        <div className={cn(base, className)}>
          <div
            className={cn(
              "absolute inset-0 bg-grid bg-repeat",
              dark ? "bg-grid-dark" : "bg-grid-light",
            )}
          />
          <div className="absolute inset-x-0 top-0 h-24 animate-pulse-slow bg-linear-to-b from-blue-500/10 to-transparent" />
        </div>
      );

    case "blueprint":
      return (
        <div className={cn(base, className)}>
          <div className="absolute inset-0 bg-grid bg-repeat bg-grid-dark" />
          <div className="absolute left-6 top-6 h-3 w-3 border-l border-t border-blue-400/40" />
          <div className="absolute right-6 top-6 h-3 w-3 border-r border-t border-blue-400/40" />
          <div className="absolute bottom-6 left-6 h-3 w-3 border-b border-l border-blue-400/40" />
          <div className="absolute bottom-6 right-6 h-3 w-3 border-b border-r border-blue-400/40" />
        </div>
      );

    case "cloud":
      return (
        <div className={cn(base, className)}>
          <div className="absolute inset-0 bg-grid-sm bg-repeat opacity-40 bg-grid-light" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl" />
        </div>
      );

    case "grid":
    default:
      return (
        <div className={cn(base, className)}>
          <div
            className={cn(
              "absolute inset-0 bg-grid bg-repeat",
              dark ? "bg-grid-dark" : "bg-grid-light",
            )}
          />
        </div>
      );
  }
}
