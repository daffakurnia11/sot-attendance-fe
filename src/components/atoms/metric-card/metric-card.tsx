import type { ReactNode } from "react";

import { cn } from "@/lib";

import { type StatusTone, statusToneClasses } from "../status-indicator";

type Props = Readonly<{
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  tone?: StatusTone | "neutral";
  dot?: boolean;
  variant?: "compact" | "decorated";
  index?: number;
}>;

export function MetricCard({ label, value, note, tone = "neutral", dot = false, variant = "compact", index }: Props) {
  const decorated = variant === "decorated";
  const color = tone === "neutral" ? "text-[var(--color-primary-bright)]" : statusToneClasses[tone];
  return (
    <article
      className={cn(
        "relative overflow-hidden border border-[var(--color-border)]",
        decorated
          ? "min-h-[164px] bg-[linear-gradient(135deg,rgba(242,182,61,.07),rgba(255,255,255,.015))] px-[18px] pt-[18px] pb-4 shadow-[inset_3px_0_0_rgba(242,182,61,.55)] after:absolute after:-top-9 after:-right-9 after:h-[86px] after:w-[86px] after:rotate-45 after:border after:border-[rgba(242,182,61,.12)] after:content-['']"
          : "bg-[var(--color-panel-soft)] px-5 py-4",
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        <p
          className={cn(
            "flex items-center gap-2 text-xs font-black tracking-[.14em] uppercase",
            decorated ? "text-[var(--color-foreground-muted)]" : "text-[var(--color-primary-muted)]",
          )}
        >
          {dot ? <i aria-hidden="true" className={cn("h-2 w-2 rounded-full bg-current", color)} /> : null}
          {label}
        </p>
        {index !== undefined ? (
          <span className="font-display text-base text-[var(--color-primary-muted)]">
            {String(index).padStart(2, "0")}
          </span>
        ) : null}
      </div>
      <strong
        className={cn(
          "block font-display font-normal",
          color,
          decorated ? "my-3.5 text-[38px] tracking-[.02em]" : "mt-2 text-3xl",
        )}
      >
        {value}
      </strong>
      {note ? (
        <p className={cn("text-xs text-[var(--color-foreground-muted)]", decorated ? "truncate pr-1 pb-3" : "mt-1")}>
          {note}
        </p>
      ) : null}
      {decorated ? (
        <div
          aria-hidden="true"
          className="absolute right-[18px] bottom-[18px] left-[18px] h-0.5 overflow-hidden bg-[rgba(242,182,61,.12)]"
        >
          <i className="block h-full w-1/3 bg-[var(--color-primary)] shadow-[0_0_12px_rgba(242,182,61,.45)]" />
        </div>
      ) : null}
    </article>
  );
}
