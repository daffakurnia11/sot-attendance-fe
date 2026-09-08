"use client";
import type { ReactNode } from "react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib";

export type PanelProps = Readonly<{
  children: ReactNode;
  title?: string;
  code?: string;
  summary?: ReactNode;
  action?: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  className?: string;
}>;
export function Panel({ children, title, code, summary, action, toolbar, footer, className }: PanelProps) {
  const { translate } = useI18n();
  return (
    <section
      className={cn(
        "overflow-hidden border border-[var(--color-border)] bg-[var(--panel-background)] shadow-[inset_0_3px_0_var(--color-panel-accent)]",
        className,
      )}
    >
      {title ? (
        <header className="flex min-h-[52px] flex-col items-start justify-between gap-2 border-b border-[var(--color-border)] px-[18px] py-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 items-center gap-[11px] uppercase">
            {code ? (
              <span className="grid h-[30px] w-[30px] shrink-0 place-items-center border border-[var(--color-border)] text-xs font-black text-[var(--color-primary)]">
                {code}
              </span>
            ) : null}
            <h2 className="font-display text-[22px] font-normal tracking-[.04em] uppercase">{translate(title)}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto">
            {summary ? (
              <span className="mr-auto text-xs font-black tracking-[.14em] text-[var(--color-primary)] uppercase sm:text-right">
                {summary}
              </span>
            ) : null}
            {action}
          </div>
        </header>
      ) : null}
      {toolbar ? <div className="border-b border-[var(--color-border-subtle)] px-[18px] py-2.5">{toolbar}</div> : null}
      {children}
      {footer ? <footer className="border-t border-[var(--color-border-subtle)]">{footer}</footer> : null}
    </section>
  );
}
