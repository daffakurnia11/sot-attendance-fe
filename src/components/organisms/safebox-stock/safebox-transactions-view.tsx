"use client";

import { DataTable, DataTableCell, dataTableRowClassName, ResourceState, RouteTabs } from "@/components/atoms";
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
      <div className="mt-[var(--space-section)]">
        <DataTable
          code="SL"
          columns={[
            { label: t("Date"), className: "w-44" },
            { label: t("Action"), className: "w-28" },
            { label: t("Item") },
            { label: t("Reason") },
            { label: t("Actor"), className: "w-44" },
          ]}
          empty="No safebox transactions recorded."
          summary={t("{count} transactions", { count: transactions.length })}
          title={t("Transaction log")}
        >
          {transactions.map((entries) => {
            const entry = entries[0];
            return (
              <tr className={dataTableRowClassName} key={entry.id}>
                <DataTableCell className="align-top">{formatDate(entry.created_at)}</DataTableCell>
                <DataTableCell
                  className={`${entry.delta >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger-soft)]"} align-top`}
                >
                  {formatAction(entry.action)}
                </DataTableCell>
                <DataTableCell className="min-w-[300px] whitespace-normal">
                  <div className="grid gap-2">
                    {entries.map((item) => (
                      <div className="grid grid-cols-[minmax(120px,1fr)_auto_auto] items-center gap-4" key={item.id}>
                        <strong className="text-[var(--color-foreground)]">{item.item_name}</strong>
                        <span
                          className={
                            item.delta >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger-soft)]"
                          }
                        >
                          {item.delta >= 0 ? "+" : "−"}
                          {formatNumber(Math.abs(item.delta))}
                        </span>
                        <span className="text-[10px] text-[var(--color-foreground-muted)]">
                          {formatNumber(item.quantity_before)} → {formatNumber(item.quantity_after)}
                        </span>
                      </div>
                    ))}
                  </div>
                </DataTableCell>
                <DataTableCell className="max-w-[320px] whitespace-normal align-top">{entry.reason}</DataTableCell>
                <DataTableCell className="align-top">
                  <strong className="block text-[var(--color-foreground)]">{entry.actor_name}</strong>
                  {entry.actor_username ? <span className="text-[10px]">@{entry.actor_username}</span> : null}
                </DataTableCell>
              </tr>
            );
          })}
        </DataTable>
      </div>
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
