import type { ReactNode } from "react";

import { cn } from "@/lib";
export type StatusTone = "success" | "danger" | "warning" | "muted";
export const statusToneClasses: Record<StatusTone, string> = {
  success: "text-[var(--color-success)]",
  danger: "text-[var(--color-danger-soft)]",
  warning: "text-[var(--color-primary-bright)]",
  muted: "text-[var(--color-foreground-muted)]",
};
export function StatusIndicator({
  children,
  tone,
  dot = true,
}: Readonly<{ children: ReactNode; tone: StatusTone; dot?: boolean }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-black tracking-[.1em] uppercase",
        statusToneClasses[tone],
      )}
    >
      {dot ? <i aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
