import type { ReactNode } from "react";
export function Field({
  label,
  help,
  children,
}: Readonly<{ label: ReactNode; help?: ReactNode; children: ReactNode }>) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
        {label}
      </span>
      {children}
      {help ? <span className="text-xs text-[var(--color-foreground-muted)]">{help}</span> : null}
    </label>
  );
}
