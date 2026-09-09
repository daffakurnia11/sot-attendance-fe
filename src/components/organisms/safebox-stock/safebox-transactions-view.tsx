"use client";

import { useState } from "react";

import { ResourceState, RouteTabs, SplitPanel } from "@/components/atoms";
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
      {transactions.length ? (
        <TransactionExplorer transactions={transactions} />
      ) : (
        <div className="mt-[var(--space-section)]">
          <ResourceState state="empty" message="No safebox transactions recorded." />
        </div>
      )}
    </>
  );
}

function TransactionExplorer({ transactions }: Readonly<{ transactions: TransactionEntry[][] }>) {
  const { t } = useI18n();
  const [selectedID, setSelectedID] = useState(transactions[0][0].id);
  const selected = transactions.find((entries) => entries.some((entry) => entry.id === selectedID)) ?? transactions[0];
  const activeID = selected[0].id;
  return (
    <div className="mt-[var(--space-section)]">
      <SplitPanel
        sidebar={
          <div className="min-w-0">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase">
                  History
                </p>
                <h2 className="mt-1 font-display text-xl font-normal uppercase">{t("Transaction log")}</h2>
              </div>
              <span className="text-[10px] font-bold text-[var(--color-primary-muted)]">{transactions.length}</span>
            </div>
            <div className="grid max-h-[620px] gap-2 overflow-y-auto pr-1">
              {transactions.map((entries) => {
                const entry = entries[0];
                const active = entry.id === activeID;
                return (
                  <button
                    aria-pressed={active}
                    className={`w-full border p-3 text-left transition-colors ${active ? "border-[var(--color-primary)] bg-[rgba(242,182,61,.09)]" : "border-[var(--color-border)] bg-[rgba(3,3,2,.42)] hover:border-[var(--color-primary-muted)]"}`}
                    key={entry.id}
                    onClick={() => setSelectedID(entry.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <ActionBadge entry={entry} />
                      <span className="text-[10px] text-[var(--color-foreground-muted)]">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                    <strong className="mt-2 block truncate text-xs text-[var(--color-foreground)]">
                      {entry.reason}
                    </strong>
                    <span className="mt-1 block text-[10px] text-[var(--color-foreground-muted)]">
                      {entries.length} {entries.length === 1 ? "item" : "items"} · {entry.actor_name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        }
      >
        <TransactionDetail entries={selected} />
      </SplitPanel>
    </div>
  );
}

function TransactionDetail({ entries }: Readonly<{ entries: TransactionEntry[] }>) {
  const { t } = useI18n();
  const entry = entries[0];
  return (
    <article>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <p className="text-[10px] font-extrabold tracking-[.2em] text-[var(--color-primary-muted)] uppercase">
            Transaction detail
          </p>
          <div className="mt-2 flex items-center gap-3">
            <ActionBadge entry={entry} />
            <time className="text-xs text-[var(--color-foreground-muted)]" dateTime={entry.created_at}>
              {formatDate(entry.created_at)}
            </time>
          </div>
        </div>
        <div className="text-right text-xs">
          <strong className="block text-[var(--color-foreground)]">{entry.actor_name}</strong>
          {entry.actor_username ? (
            <span className="text-[10px] text-[var(--color-foreground-muted)]">@{entry.actor_username}</span>
          ) : null}
        </div>
      </header>
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <span className="block text-[9px] font-extrabold tracking-[.14em] text-[var(--color-primary-muted)] uppercase">
          {t("Reason")}
        </span>
        <p className="mt-1 text-sm text-[var(--color-foreground)]">{entry.reason}</p>
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl uppercase">{t("Item")}</h3>
          <span className="text-[10px] font-bold text-[var(--color-primary-muted)]">{entries.length}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((item) => (
            <ItemChangeCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </article>
  );
}

function ActionBadge({ entry }: Readonly<{ entry: TransactionEntry }>) {
  const positive = entry.delta >= 0;
  return (
    <span
      className={`border px-2 py-1 text-[10px] font-extrabold tracking-[.12em] uppercase ${positive ? "border-[rgba(42,211,169,.35)] bg-[rgba(42,211,169,.08)] text-[var(--color-success)]" : "border-[rgba(239,116,116,.35)] bg-[rgba(239,116,116,.08)] text-[var(--color-danger-soft)]"}`}
    >
      {formatAction(entry.action)}
    </span>
  );
}

function ItemChangeCard({ item }: Readonly<{ item: TransactionEntry }>) {
  return (
    <div className="border border-[var(--color-border)] bg-[rgba(3,3,2,.42)] p-3">
      <div className="flex items-start justify-between gap-3">
        <strong className="text-xs text-[var(--color-foreground)]">{item.item_name}</strong>
        <span
          className={`text-sm font-black ${item.delta >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger-soft)]"}`}
        >
          {item.delta >= 0 ? "+" : "−"}
          {formatNumber(Math.abs(item.delta))}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <StockValue label="Before" value={item.quantity_before} />
        <span className="text-[var(--color-primary-muted)]" aria-hidden="true">
          →
        </span>
        <StockValue label="After" value={item.quantity_after} />
      </div>
    </div>
  );
}

function StockValue({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div>
      <span className="block text-[8px] font-bold tracking-[.12em] text-[var(--color-foreground-muted)] uppercase">
        {label}
      </span>
      <strong className="mt-0.5 block text-base text-[var(--color-foreground)]">{formatNumber(value)}</strong>
    </div>
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
