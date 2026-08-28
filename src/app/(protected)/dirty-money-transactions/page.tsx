import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Dirty Money Transaction" };

export default async function DirtyMoneyTransactionsPage() {
  redirect(routes.moneyTransactions.tabs.dirty);
}
