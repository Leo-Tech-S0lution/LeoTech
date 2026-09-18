"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary: "bg-blue-500 text-white hover:bg-blue-600 disabled:hover:bg-blue-500",
  secondary: "bg-navy-900 text-white hover:bg-navy-800 disabled:hover:bg-navy-900",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-md",
  md: "px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "px-5 py-2.5 text-sm gap-2 rounded-lg",
  icon: "h-9 w-9 rounded-md",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {
  href?: undefined;
}

interface ButtonAsLink
  extends BaseProps,
    Omit<React.ComponentProps<typeof Link>, keyof BaseProps> {
  href: string;
}

type AdminButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export function AdminButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: AdminButtonProps) {
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}
