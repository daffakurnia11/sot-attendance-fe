import type { ReactNode } from "react";
export function PlayerIdentity({ name, detail }: Readonly<{ name: ReactNode; detail?: ReactNode }>) {
  return (
    <span className="min-w-0">
      <strong className="block truncate text-[var(--color-foreground)]">{name}</strong>
      {detail ? (
        <span className="mt-1 block truncate text-xs text-[var(--color-foreground-muted)]">{detail}</span>
      ) : null}
    </span>
  );
}
