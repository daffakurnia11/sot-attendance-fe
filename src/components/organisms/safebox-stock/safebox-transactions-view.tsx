"use client";

import { ResourceState, RouteTabs } from "@/components/atoms";
import { routes } from "@/config/routes";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import { createRouteFetcher } from "@/lib/route-fetcher";
import { type SafeboxTransactions, safeboxTransactionsSchema } from "@/services/safebox-stock";

type Props = Readonly<{ safebox: "public" | "boss"; initialData: SafeboxTransactions | null }>;
type TransactionEntry = SafeboxTransactions["transactions"][number];

export function groupSafeboxTransactions(entries: TransactionEntry[]) {
  const groups = new Map<string, TransactionEntry[]>();
  for (const entry of entries) {
    const key = [
      entry.created_at,
      entry.safebox,
      entry.action,
      entry.reason,
      entry.actor_name,
      entry.actor_username,
    ].join("\u0000");
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  }
  return [...groups.values()];
}

export function SafeboxTransactionsView({ safebox, initialData }: Props) {
  const { t } = useI18n();
  const path = `/api/safebox-stock/transactions?safebox=${safebox}`;
  const { data, failed, stale, retry, isLoading } = useLiveResource({
    initialData,
    path,
    fetcher: createRouteFetcher(path, safeboxTransactionsSchema),
  });
  const transactions = groupSafeboxTransactions(data?.transactions ?? []);
  if (!data)
    return (
      <ResourceState
        state={isLoading ? "loading" : "unavailable"}
        message={isLoading ? "Loading data..." : "Safebox transactions could not be loaded."}
        onRetry={() => void retry()}
      />
    );
  return (
    <>
      <RouteTabs
        label="Safebox"
        active={safebox}
        items={[
          { key: "public", label: "Public Safebox", href: `${routes.safeboxTransactions}?safebox=public` },
          { key: "boss", label: "Boss Safebox", href: `${routes.safeboxTransactions}?safebox=boss` },
        ]}
      />
      {stale || failed ? (
        <ResourceState
          state="stale"
          message="Safebox transactions could not be refreshed."
          onRetry={() => void retry()}
        />
      ) : null}
      <section className="mt-[var(--space-section)] border border-[var(--color-border)] bg-[rgba(13,10,6,.72)]">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center border border-[var(--color-border)] text-[10px] font-black text-[var(--color-primary-bright)]">
              SL
            </span>
            <h2 className="font-display text-2xl font-normal uppercase">{t("Transaction log")}</h2>
          </div>
          <span className="text-[10px] font-extrabold tracking-[.14em] text-[var(--color-primary-bright)] uppercase">
            {t("{count} transactions", { count: transactions.length })}
          </span>
        </header>
        {!transactions.length ? (
          <ResourceState state="empty" message="No safebox transactions recorded." />
        ) : (
          <div className="grid gap-3 p-3 lg:grid-cols-2">
            {transactions.map((entries) => {
              const entry = entries[0];
              const positive = entry.delta >= 0;
              return (
                <article className="border border-[var(--color-border)] bg-[rgba(3,3,2,.52)]" key={entry.id}>
                  <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`border px-2 py-1 text-[10px] font-extrabold tracking-[.12em] uppercase ${positive ? "border-[rgba(42,211,169,.35)] bg-[rgba(42,211,169,.08)] text-[var(--color-success)]" : "border-[rgba(239,116,116,.35)] bg-[rgba(239,116,116,.08)] text-[var(--color-danger-soft)]"}`}
                      >
                        {formatAction(entry.action)}
                      </span>
                      <time className="text-xs text-[var(--color-foreground-muted)]" dateTime={entry.created_at}>
                        {formatDate(entry.created_at)}
                      </time>
                    </div>
                    <div className="text-right text-xs">
                      <strong className="block text-[var(--color-foreground)]">{entry.actor_name}</strong>
                      {entry.actor_username ? (
                        <span className="text-[10px] text-[var(--color-foreground-muted)]">
                          @{entry.actor_username}
                        </span>
                      ) : null}
                    </div>
                  </header>
                  <div className="grid gap-2 p-3 sm:grid-cols-2">
                    {entries.map((item) => (
                      <div className="border border-[rgba(217,169,80,.14)] px-3 py-2" key={item.id}>
                        <div className="flex items-start justify-between gap-3">
                          <strong className="text-xs text-[var(--color-foreground)]">{item.item_name}</strong>
                          <span
                            className={`text-sm font-black ${item.delta >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger-soft)]"}`}
                          >
                            {item.delta >= 0 ? "+" : "−"}
                            {formatNumber(Math.abs(item.delta))}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-foreground-muted)]">
                          <span>{formatNumber(item.quantity_before)}</span>
                          <span aria-hidden="true">→</span>
                          <strong className="text-[var(--color-foreground)]">
                            {formatNumber(item.quantity_after)}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                  <footer className="border-t border-[var(--color-border)] px-4 py-3">
                    <span className="block text-[9px] font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
                      {t("Reason")}
                    </span>
                    <p className="mt-1 text-xs text-[var(--color-foreground)]">{entry.reason}</p>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

function formatAction(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
