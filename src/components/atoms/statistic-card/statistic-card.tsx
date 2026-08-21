"use client";

import { useI18n } from "@/i18n";

export type StatisticCardProps = Readonly<{
  index: number;
  label: string;
  note?: string;
  value: string;
}>;

export function StatisticCard({ index, label, note = "Personal attendance record", value }: StatisticCardProps) {
  const { translate } = useI18n();
  return (
    <article className="relative min-h-[164px] overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(242,182,61,.07),rgba(255,255,255,.015))] px-[18px] pt-[18px] pb-4 shadow-[inset_3px_0_0_rgba(242,182,61,.55)] after:absolute after:-top-9 after:-right-9 after:h-[86px] after:w-[86px] after:rotate-45 after:border after:border-[rgba(242,182,61,.12)] after:content-['']">
      <div className="flex items-center justify-between gap-2.5">
        <p className="text-xs font-extrabold tracking-[.14em] text-[var(--color-foreground-muted)] uppercase">
          {translate(label)}
        </p>
        <span className="font-[Impact] text-base text-[rgba(242,182,61,.35)]">{String(index).padStart(2, "0")}</span>
      </div>
      <strong className="my-3.5 block font-[Impact] text-[38px] font-normal tracking-[.02em] text-[var(--color-primary-bright)]">
        {value}
      </strong>
      <span className="block truncate pr-1 text-xs text-[var(--color-foreground-muted)]">{translate(note)}</span>
      <div
        className="absolute right-[18px] bottom-[18px] left-[18px] h-0.5 overflow-hidden bg-[rgba(242,182,61,.12)]"
        aria-hidden="true"
      >
        <i className="block h-full w-1/3 bg-[var(--color-primary)] shadow-[0_0_12px_rgba(242,182,61,.45)]" />
      </div>
    </article>
  );
}
