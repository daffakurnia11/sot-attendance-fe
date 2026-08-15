"use client";

import { useI18n } from "@/i18n";

export const DEFAULT_TABLE_PAGE_SIZE = 10;

export function paginateItems<T>(items: readonly T[], page: number, pageSize = DEFAULT_TABLE_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function TablePagination({ onPageChange, page, pageSize = DEFAULT_TABLE_PAGE_SIZE, total }: { onPageChange: (page: number) => void; page: number; pageSize?: number; total: number }) {
  const { t } = useI18n();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : ((safePage - 1) * pageSize) + 1;
  const end = Math.min(safePage * pageSize, total);

  return <div className="flex flex-wrap items-center justify-between gap-3 px-[18px] py-3 text-xs font-bold tracking-[.08em] uppercase">
    <span className="text-[var(--color-foreground-muted)]">{t("{start}–{end} of {total}", { start, end, total })}</span>
    <div className="flex items-center gap-2">
      <button aria-label={t("Previous page")} className="grid h-9 w-9 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-35" disabled={safePage === 1} onClick={() => onPageChange(safePage - 1)} type="button">‹</button>
      <span className="min-w-[82px] text-center text-[var(--color-foreground)]">{t("{page} / {totalPages}", { page: safePage, totalPages })}</span>
      <button aria-label={t("Next page")} className="grid h-9 w-9 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-35" disabled={safePage === totalPages} onClick={() => onPageChange(safePage + 1)} type="button">›</button>
    </div>
  </div>;
}
