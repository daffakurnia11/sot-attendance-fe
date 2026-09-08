"use client";
import Link from "next/link";

import { useI18n } from "@/i18n";
import { cn } from "@/lib";
export function RouteTabs({
  label,
  active,
  items,
}: Readonly<{
  label: string;
  active: string;
  items: readonly { key: string; label: string; href: string; note?: string }[];
}>) {
  const { translate } = useI18n();
  return (
    <nav
      aria-label={translate(label)}
      className="mt-6 flex border border-[var(--color-border)] bg-[var(--color-panel-soft)] p-1"
    >
      {items.map((item) => (
        <Link
          key={item.key}
          aria-current={active === item.key ? "page" : undefined}
          href={item.href}
          className={cn(
            "flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2 border border-transparent px-3 py-2 text-center no-underline transition-colors sm:justify-start",
            active === item.key
              ? "border-[var(--color-border)] bg-[var(--panel-active-background)] text-[var(--color-primary-bright)]"
              : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]",
          )}
        >
          <strong className="text-xs tracking-[.08em] uppercase">{translate(item.label)}</strong>
          {item.note ? (
            <span className="hidden text-xs text-[var(--color-foreground-muted)] lg:inline">
              — {translate(item.note)}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
