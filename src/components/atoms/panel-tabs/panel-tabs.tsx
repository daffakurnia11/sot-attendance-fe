"use client";
import { useId, useState } from "react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib";

type PanelTab = { key: string; label: string; children: React.ReactNode };

/**
 * In-page tabs styled to match RouteTabs, which navigates instead of switching
 * panels. Same shell so a settings tab strip and a route tab strip read as one
 * control; the semantics differ because only this one owns its panels.
 */
export function PanelTabs({
  label,
  items,
}: Readonly<{
  label: string;
  // Non-empty: the first entry is the tab shown before anything is clicked.
  items: readonly [PanelTab, ...PanelTab[]];
}>) {
  const { translate } = useI18n();
  const id = useId();
  const [active, setActive] = useState(items[0].key);
  const current = items.find((item) => item.key === active) ?? items[0];

  return (
    <>
      <div
        aria-label={translate(label)}
        className="mt-6 flex border border-[var(--color-border)] bg-[var(--color-panel-soft)] p-1"
        role="tablist"
      >
        {items.map((item) => (
          <button
            aria-controls={`${id}-${item.key}-panel`}
            aria-selected={current.key === item.key}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center border border-transparent px-3 py-2 text-center transition-colors sm:justify-start",
              current.key === item.key
                ? "border-[var(--color-border)] bg-[var(--panel-active-background)] text-[var(--color-primary-bright)]"
                : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]",
            )}
            id={`${id}-${item.key}-tab`}
            key={item.key}
            onClick={() => setActive(item.key)}
            role="tab"
            type="button"
          >
            <strong className="text-xs tracking-[.08em] uppercase">{translate(item.label)}</strong>
          </button>
        ))}
      </div>
      <div aria-labelledby={`${id}-${current.key}-tab`} id={`${id}-${current.key}-panel`} role="tabpanel">
        {current.children}
      </div>
    </>
  );
}
