"use client";

import { useI18n } from "@/i18n";
import { cn } from "@/lib";

export function ItemQuantityCard({
  index,
  name,
  quantity,
  quantityIntent = "default",
  note,
  details,
}: Readonly<{
  index: number;
  name: string;
  quantity: number;
  quantityIntent?: "default" | "success" | "danger";
  note: string;
  details?: ReadonlyArray<{ label: string; quantity: number; intent?: "default" | "success" | "danger" }>;
}>) {
  const { locale, translate } = useI18n();
  const formatQuantity = (value: number) => value.toLocaleString(locale === "id" ? "id-ID" : "en-GB");
  return (
    <article className="relative min-h-24 overflow-hidden border border-[var(--color-border)] bg-[var(--color-control-background)] px-3 py-2.5">
      <span className="absolute top-2 right-2.5 text-xs font-black text-[var(--color-primary-muted)]">
        {String(index).padStart(2, "0")}
      </span>
      <p className="pr-6 text-xs font-extrabold tracking-[.1em] text-[var(--color-foreground-muted)] uppercase">
        {name}
      </p>
      <p
        className={cn(
          "mt-1.5 font-display text-3xl leading-none",
          quantityIntent === "default" && "text-[var(--color-primary-bright)]",
          quantityIntent === "success" && "text-[var(--color-success)]",
          quantityIntent === "danger" && "text-[var(--color-danger-soft)]",
        )}
      >
        {formatQuantity(quantity)}
      </p>
      <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">{translate(note)}</p>
      {details?.length ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[var(--color-border)] pt-2">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-[9px] font-bold tracking-wider text-[var(--color-foreground-muted)] uppercase">
                {translate(detail.label)}
              </dt>
              <dd
                className={cn(
                  "mt-0.5 text-sm font-extrabold",
                  detail.intent === "success" && "text-[var(--color-success)]",
                  detail.intent === "danger" && "text-[var(--color-danger)]",
                )}
              >
                {formatQuantity(detail.quantity)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}
