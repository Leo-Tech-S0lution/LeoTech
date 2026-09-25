import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { getIcon } from "@/lib/icons";

/**
 * Renders a lucide icon chosen by name (CMS-configured icons). Uses
 * createElement on the statically-defined component from the ICONS map, so no
 * component is created during render (React Compiler `static-components` rule).
 */
export function DynamicIcon({ icon, ...props }: { icon: string | null | undefined } & Omit<LucideProps, "name">) {
  return createElement(getIcon(icon), props);
}
