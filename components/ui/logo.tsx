import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  variant?: "dark" | "light";
  size?: number;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

/**
 * Renders the LeoTech Solution brand mark exactly as supplied — no cropping,
 * recoloring beyond the dedicated light variant, or proportion changes.
 */
export function Logo({
  variant = "dark",
  size = 44,
  href = "/",
  className,
  priority = false,
}: LogoProps) {
  const src =
    variant === "light"
      ? "/brand/leotech-logo-light.svg"
      : "/brand/leotech-logo.svg";

  const image = (
    <Image
      src={src}
      alt="LeoTech Solution"
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 select-none", className)}
    />
  );

  if (!href) return image;

  return (
    <Link href={href} aria-label="LeoTech Solution — home" className="inline-flex shrink-0">
      {image}
    </Link>
  );
}
