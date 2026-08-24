import Link from "next/link";

import { routes } from "@/config/routes";
import { cn } from "@/lib";

export type AttendanceMode = "recap" | "calendar";

export function AttendanceModeTabs({ active }: Readonly<{ active: AttendanceMode }>) {
  return (
    <nav
      aria-label="Attendance view"
      className="mt-6 flex border border-[var(--color-border)] bg-[rgba(255,255,255,.012)] p-1"
    >
      {(
        [
          ["recap", "Attendance Recap", "Roster totals and playtime"],
          ["calendar", "Attendance Calendar", "Daily turnout and status"],
        ] as const
      ).map(([mode, label, note]) => (
        <Link
          aria-current={active === mode ? "page" : undefined}
          className={cn(
            "flex min-w-0 flex-1 items-center justify-center gap-2 border border-transparent px-3 py-2 text-center no-underline transition-colors sm:justify-start",
            active === mode
              ? "border-[var(--color-border)] bg-[linear-gradient(90deg,rgba(242,182,61,.14),transparent)] text-[var(--color-primary-bright)]"
              : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]",
          )}
          href={routes.attendanceTabs[mode]}
          key={mode}
        >
          <strong className="text-xs tracking-[.08em] uppercase">{label}</strong>
          <span className="hidden text-xs text-[var(--color-foreground-muted)] lg:inline">— {note}</span>
        </Link>
      ))}
    </nav>
  );
}
