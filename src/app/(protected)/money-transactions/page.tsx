import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MoneyTransactionsView } from "@/components/organisms";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import type { MoneyAccount } from "@/services/money-transactions";
import { loadMoneyTransactions } from "@/services/money-transactions/money-transactions.service.server";

export const metadata: Metadata = { title: "Money Transactions" };

export default async function MoneyTransactionsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ account?: string }> }>) {
  if (!(await isAdminSession())) redirect(routes.dashboard);
  const account: MoneyAccount = (await searchParams).account === "dirty" ? "dirty" : "office";
  return (
    <MoneyTransactionsView
      account={account}
      initialData={await loadMoneyTransactions(account, routes.moneyTransactions.tabs[account])}
    />
  );
}
