import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SafeboxTransactionsView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadSafeboxTransactions } from "@/services/safebox-stock/safebox-transactions.service.server";

export const metadata: Metadata = { title: "Safebox Transaction Log" };

export default async function SafeboxTransactionsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ safebox?: string }> }>) {
  if (!(await isAdminSession())) redirect(routes.dashboard);
  const safebox = (await searchParams).safebox === "boss" ? "boss" : "public";
  return (
    <DashboardPage
      title="Safebox Transaction Log"
      eyebrow="Business operations"
      description="Review every stock deposit and withdrawal."
    >
      <SafeboxTransactionsView
        safebox={safebox}
        initialData={await loadSafeboxTransactions(`${routes.safeboxTransactions}?safebox=${safebox}`, safebox)}
      />
    </DashboardPage>
  );
}
