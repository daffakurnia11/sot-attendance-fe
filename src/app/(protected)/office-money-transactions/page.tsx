import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export const metadata: Metadata = { title: "Office Money Transaction" };

export default async function OfficeMoneyTransactionsPage() {
  redirect(routes.moneyTransactions.tabs.office);
}
