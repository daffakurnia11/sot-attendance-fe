import type { ReactNode } from "react";
export function SplitPanel({ sidebar, children }: Readonly<{ sidebar: ReactNode; children: ReactNode }>) {
  return (
    <section className="grid overflow-hidden border border-[var(--color-border)] bg-[var(--color-panel-soft)] lg:grid-cols-[330px_minmax(0,1fr)]">
      <div className="grid content-start gap-4 border-b border-[var(--color-border)] p-4 lg:border-r lg:border-b-0">
        {sidebar}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
