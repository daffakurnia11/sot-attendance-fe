import type { ReactNode } from "react";

export function AttendanceCalendarGrid({ locale, children }: Readonly<{ locale: "en" | "id"; children: ReactNode }>) {
  const formatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en", { weekday: "short", timeZone: "UTC" });
  return (
    <div className="grid min-w-[760px] grid-cols-7 gap-3">
      {Array.from({ length: 7 }, (_, offset) => formatter.format(new Date(Date.UTC(2026, 7, 3 + offset)))).map(
        (weekday) => (
          <span
            className="pb-1 text-center text-xs font-black tracking-[.14em] text-[var(--color-primary-muted)] uppercase"
            key={weekday}
          >
            {weekday}
          </span>
        ),
      )}
      {children}
    </div>
  );
}
