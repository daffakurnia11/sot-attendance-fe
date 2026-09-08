"use client";

import {
  DataTable,
  DataTableCell,
  dataTableRowClassName,
  MetricCard,
  ResourceState,
  RouteTabs,
} from "@/components/atoms";
import { routes } from "@/config/routes";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import type { MoneyAccount, MoneyTransactions } from "@/services/money-transactions";
import { fetchDirtyMoneyTransactionsRoute, fetchOfficeMoneyTransactionsRoute } from "@/services/money-transactions";

type Props = Readonly<{
  account: MoneyAccount;
  initialData: MoneyTransactions | null;
}>;

export function MoneyTransactionsView({ account, initialData }: Props) {
  const office = account === "office";
  const { data, failed, stale, retry, isLoading } = useLiveResource({
    initialData,
    path: `/api/money-transactions?account=${account}`,
    fetcher: office ? fetchOfficeMoneyTransactionsRoute : fetchDirtyMoneyTransactionsRoute,
  });
  const { t } = useI18n();
  const transactions = data?.transactions ?? [];

  if (!data)
    return (
      <ResourceState
        state={isLoading ? "loading" : "unavailable"}
        message={isLoading ? "Loading data..." : "Data could not be loaded."}
        onRetry={() => void retry()}
      />
    );
  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <BalanceCard label={t("Current Office Money Balance")} value={data?.balances.office} />
        <BalanceCard label={t("Current Dirty Money Balance")} value={data?.balances.dirty} />
      </div>
      <RouteTabs
        label="Money account"
        active={account}
        items={[
          { key: "office", label: "Office Money", href: routes.moneyTransactions.tabs.office },
          { key: "dirty", label: "Dirty Money", href: routes.moneyTransactions.tabs.dirty },
        ]}
      />
      {stale || failed ? (
        <ResourceState
          state="stale"
          message={
            stale ? "Live updates stopped. Sign in again to resume." : "Money transactions could not be refreshed."
          }
          onRetry={() => void retry()}
        />
      ) : null}
      <div className="mt-[var(--space-section)]">
        <DataTable
          code={office ? "OM" : "DM"}
          columns={[
            { label: t("Date"), className: "w-44" },
            { label: t("Action"), className: "w-28" },
            { label: t("Amount"), className: "w-36" },
            { label: t("Balance Before"), className: "w-40" },
            { label: t("Balance After"), className: "w-40" },
            { label: t("Reason") },
            { label: t("Actor"), className: "w-44" },
          ]}
          empty={t("No money transactions recorded.")}
          summary={t("{count} transactions", { count: transactions.length })}
          title={t("Transaction log")}
        >
          {transactions.map((transaction) => (
            <tr className={dataTableRowClassName} key={transaction.id}>
              <DataTableCell>{formatDate(transaction.created_at)}</DataTableCell>
              <DataTableCell>
                <span
                  className={
                    transaction.direction === "credit"
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger-soft)]"
                  }
                >
                  {t(
                    transaction.type === "withdrawal"
                      ? "Withdrawal"
                      : transaction.type === "deposit"
                        ? "Deposit"
                        : transaction.type === "opening"
                          ? "Opening"
                          : "Reversal",
                  )}
                </span>
              </DataTableCell>
              <DataTableCell className="font-bold text-[var(--color-foreground)]">
                {transaction.direction === "credit" ? "+" : "−"} ${formatMoney(transaction.amount)}
              </DataTableCell>
              <DataTableCell>$ {formatMoney(transaction.balance_before)}</DataTableCell>
              <DataTableCell>$ {formatMoney(transaction.balance_after)}</DataTableCell>
              <DataTableCell className="max-w-[320px] whitespace-normal">{transaction.reason}</DataTableCell>
              <DataTableCell>
                <strong className="block text-[var(--color-foreground)]">{transaction.actor_name}</strong>
                <span className="text-[10px]">@{transaction.actor_username}</span>
              </DataTableCell>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  );
}

function BalanceCard({ label, value }: Readonly<{ label: string; value?: number }>) {
  return <MetricCard label={label} value={`$ ${value === undefined ? "—" : formatMoney(value)}`} />;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
