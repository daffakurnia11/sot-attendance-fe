"use client";

import { DataTable, DataTableCell, dataTableRowClassName, ResourceState, RouteTabs } from "@/components/atoms";
import { routes } from "@/config/routes";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import { createRouteFetcher } from "@/lib/route-fetcher";
import { type SafeboxTransactions, safeboxTransactionsSchema } from "@/services/safebox-stock";

type Props = Readonly<{ safebox: "public" | "boss"; initialData: SafeboxTransactions | null }>;

export function SafeboxTransactionsView({ safebox, initialData }: Props) {
  const { t } = useI18n();
  const path = `/api/safebox-stock/transactions?safebox=${safebox}`;
  const { data, failed, stale, retry, isLoading } = useLiveResource({
    initialData,
    path,
    fetcher: createRouteFetcher(path, safeboxTransactionsSchema),
  });
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
            { label: t("Item"), className: "w-44" },
            { label: t("Action"), className: "w-28" },
            { label: "Change", className: "w-24" },
            { label: "Before", className: "w-24" },
            { label: "After", className: "w-24" },
            { label: t("Reason") },
            { label: t("Actor"), className: "w-44" },
          ]}
          empty="No safebox transactions recorded."
          summary={t("{count} transactions", { count: data.transactions.length })}
          title={t("Transaction log")}
        >
          {data.transactions.map((entry) => (
            <tr className={dataTableRowClassName} key={entry.id}>
              <DataTableCell>{formatDate(entry.created_at)}</DataTableCell>
              <DataTableCell className="font-bold text-[var(--color-foreground)]">{entry.item_name}</DataTableCell>
              <DataTableCell
                className={entry.delta >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger-soft)]"}
              >
                {formatAction(entry.action)}
              </DataTableCell>
              <DataTableCell
                className={entry.delta >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger-soft)]"}
              >
                {entry.delta >= 0 ? "+" : "−"}
                {formatNumber(Math.abs(entry.delta))}
              </DataTableCell>
              <DataTableCell>{formatNumber(entry.quantity_before)}</DataTableCell>
              <DataTableCell>{formatNumber(entry.quantity_after)}</DataTableCell>
              <DataTableCell className="max-w-[320px] whitespace-normal">{entry.reason}</DataTableCell>
              <DataTableCell>
                <strong className="block text-[var(--color-foreground)]">{entry.actor_name}</strong>
                {entry.actor_username ? <span className="text-[10px]">@{entry.actor_username}</span> : null}
              </DataTableCell>
            </tr>
          ))}
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
