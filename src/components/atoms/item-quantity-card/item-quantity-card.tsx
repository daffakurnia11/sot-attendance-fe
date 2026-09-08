"use client";
import { useI18n } from "@/i18n";
export function ItemQuantityCard({
  index,
  name,
  quantity,
  note,
}: Readonly<{ index: number; name: string; quantity: number; note: string }>) {
  const { locale, translate } = useI18n();
  return (
    <article className="relative min-h-24 overflow-hidden border border-[var(--color-border)] bg-[var(--color-control-background)] px-3 py-2.5">
      <span className="absolute top-2 right-2.5 text-xs font-black text-[var(--color-primary-muted)]">
        {String(index).padStart(2, "0")}
      </span>
      <p className="pr-6 text-xs font-extrabold tracking-[.1em] text-[var(--color-foreground-muted)] uppercase">
        {name}
      </p>
      <p className="mt-1.5 font-display text-3xl leading-none text-[var(--color-primary-bright)]">
        {quantity.toLocaleString(locale === "id" ? "id-ID" : "en-GB")}
      </p>
      <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">{translate(note)}</p>
    </article>
  );
}
