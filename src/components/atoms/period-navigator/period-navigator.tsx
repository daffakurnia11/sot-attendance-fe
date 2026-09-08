"use client";
import { useI18n } from "@/i18n";
import { formatPeriod } from "@/lib/report-period";
export function PeriodNavigator({
  start,
  end,
  loading,
  onChange,
}: Readonly<{ start: string; end: string; loading: boolean; onChange: (offset: number) => void }>) {
  const { locale, t } = useI18n();
  return (
    <div className="ml-auto flex max-w-full items-center gap-2">
      <button
        className="grid h-9 w-9 shrink-0 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:opacity-40"
        disabled={loading}
        onClick={() => onChange(-1)}
        type="button"
        aria-label={t("Previous month")}
      >
        ‹
      </button>
      <strong className="min-w-0 text-center text-sm tracking-[.06em] uppercase">
        {formatPeriod(start, end, locale)}
      </strong>
      <button
        className="grid h-9 w-9 shrink-0 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:opacity-40"
        disabled={loading}
        onClick={() => onChange(1)}
        type="button"
        aria-label={t("Next month")}
      >
        ›
      </button>
    </div>
  );
}
