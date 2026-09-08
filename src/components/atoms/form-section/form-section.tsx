import type { ReactNode } from "react";
export function FormSection({
  title,
  description,
  children,
  footer,
}: Readonly<{ title: ReactNode; description: ReactNode; children: ReactNode; footer: ReactNode }>) {
  return (
    <section className="border border-[var(--color-border)] bg-[var(--color-panel-soft)]">
      <header className="border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
        <h2 className="font-display text-2xl font-normal uppercase">{title}</h2>
        <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{description}</p>
      </header>
      <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">{children}</div>
      <footer className="flex flex-col gap-3 border-t border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        {footer}
      </footer>
    </section>
  );
}
