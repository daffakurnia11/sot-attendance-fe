import type { Metadata } from "next";

import { OrderLogView } from "@/components/organisms/order-log";
import { DashboardPage } from "@/components/templates";
import { loadOrderLog } from "@/services/order-log/order-log.service.server";
export const metadata: Metadata = { title: "Order Log" };
export default async function OrderLogPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ before?: string; kind?: string }> }>) {
  const params = await searchParams;
  const before = params.before ?? "";
  const kind = ["sale", "purchase", "internal"].includes(params.kind ?? "") ? params.kind! : "";
  return (
    <DashboardPage title="Order Log" eyebrow="Transaction Log" description="Partner and internal order history.">
      <OrderLogView
        key={`${kind}-${before}`}
        before={before}
        kind={kind}
        initialData={await loadOrderLog(before, kind)}
      />
    </DashboardPage>
  );
}
