import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib";
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  density?: "compact" | "comfortable";
};
export function SearchField({ label, density = "comfortable", className, ...props }: Props) {
  return (
    <input
      {...props}
      aria-label={label}
      type="search"
      className={cn(
        "min-w-0 flex-1 border border-[var(--color-border)] bg-[var(--color-control-background)] px-3 text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-primary-muted)]",
        density === "compact" ? "h-9 text-sm" : "h-10 text-base",
        className,
      )}
    />
  );
}
