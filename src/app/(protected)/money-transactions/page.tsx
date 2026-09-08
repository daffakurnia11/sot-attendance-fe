import type { Metadata } from "next";

import { MoneyTransactionsView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { routes } from "@/config/routes";
import type { MoneyAccount } from "@/services/money-transactions";
import { loadMoneyTransactions } from "@/services/money-transactions/money-transactions.service.server";

export const metadata: Metadata = { title: "Money Transactions" };

export default async function MoneyTransactionsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ account?: string }> }>) {
  const account: MoneyAccount = (await searchParams).account === "dirty" ? "dirty" : "office";
  return (
    <DashboardPage
      title="Money Transactions"
      eyebrow="Business operations"
      description="Office and dirty money balances with complete transaction history."
    >
      <MoneyTransactionsView
        account={account}
        initialData={await loadMoneyTransactions(account, routes.moneyTransactions.tabs[account])}
      />
    </DashboardPage>
  );
}
