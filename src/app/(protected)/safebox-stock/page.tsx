import type { Metadata } from "next";

import { SafeboxStockView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { loadSafeboxStock } from "@/services/safebox-stock/safebox-stock.service.server";

export const metadata: Metadata = { title: "Safebox Stock" };

export default async function SafeboxStockPage() {
  return (
    <DashboardPage
      title="Safebox Stock"
      eyebrow="Business operations"
      description="Current stock across shared safeboxes."
    >
      <SafeboxStockView initialData={await loadSafeboxStock("/safebox-stock")} />
    </DashboardPage>
  );
}
