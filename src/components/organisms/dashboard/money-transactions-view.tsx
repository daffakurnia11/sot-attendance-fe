"use client";

import { Alert } from "antd";
import Link from "next/link";

import { DataTable, DataTableCell, dataTableRowClassName } from "@/components/atoms";
import { DashboardPage } from "@/components/templates";
import { routes } from "@/config/routes";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import { cn } from "@/lib";
import type { MoneyAccount, MoneyTransactions } from "@/services/money-transactions";
import { fetchDirtyMoneyTransactionsRoute, fetchOfficeMoneyTransactionsRoute } from "@/services/money-transactions";

type Props = Readonly<{
  account: MoneyAccount;
  initialData: MoneyTransactions | null;
}>;

export function MoneyTransactionsView({ account, initialData }: Props) {
  const office = account === "office";
  const { data, failed, stale } = useLiveResource({
    initialData,
    path: `/api/money-transactions?account=${account}`,
    fetcher: office ? fetchOfficeMoneyTransactionsRoute : fetchDirtyMoneyTransactionsRoute,
  });
  const { t } = useI18n();
  const transactions = data?.transactions ?? [];

  return (
    <DashboardPage
      description={t("Office and dirty money balances with complete transaction history.")}
      eyebrow={t("Business operations")}
      title={t("Money Transactions")}
    >
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <BalanceCard label={t("Current Office Money Balance")} value={data?.balances.office} />
        <BalanceCard label={t("Current Dirty Money Balance")} value={data?.balances.dirty} />
      </div>
      <nav
        aria-label={t("Money account")}
        className="mt-6 flex border border-[var(--color-border)] bg-[rgba(255,255,255,.012)] p-1"
      >
        {(["office", "dirty"] as const).map((tab) => (
          <Link
            aria-current={account === tab ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center border border-transparent px-3 py-2 text-center text-xs font-bold tracking-[.08em] uppercase no-underline transition-colors sm:justify-start",
              account === tab
                ? "border-[var(--color-border)] bg-[linear-gradient(90deg,rgba(242,182,61,.14),transparent)] text-[var(--color-primary-bright)]"
                : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]",
            )}
            href={routes.moneyTransactions.tabs[tab]}
            key={tab}
          >
            {tab === "office" ? t("Office Money") : t("Dirty Money")}
          </Link>
        ))}
      </nav>
      {failed || stale ? (
        <Alert
          className="mt-6"
          type={stale ? "error" : "warning"}
          showIcon
          title={t("Money transactions could not be refreshed.")}
        />
      ) : null}
      <div className="mt-[30px]">
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
                <span className={transaction.direction === "credit" ? "text-[#78e99a]" : "text-[#ff7474]"}>
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
    </DashboardPage>
  );
}

function BalanceCard({ label, value }: Readonly<{ label: string; value?: number }>) {
  return (
    <section className="border border-[var(--color-border)] bg-[linear-gradient(145deg,rgba(242,182,61,.08),rgba(255,255,255,.01))] px-5 py-4">
      <p className="text-xs font-black tracking-[.15em] text-[var(--color-primary-muted)] uppercase">{label}</p>
      <strong className="mt-2 block font-[Impact] text-[32px] font-normal tracking-[.03em] text-[var(--color-primary-bright)]">
        $ {value === undefined ? "—" : formatMoney(value)}
      </strong>
    </section>
  );
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
