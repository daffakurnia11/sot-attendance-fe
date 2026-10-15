import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PriceManagementView } from "@/components/organisms/price-management";
import { DashboardPage } from "@/components/templates";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadForMember } from "@/lib/session.server";
import { fetchPriceNotes } from "@/services/price-notes";
export const metadata: Metadata = { title: "Price Management" };
export default async function PriceManagementPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ direction?: string }> }>) {
  if (!(await isAdminSession())) redirect(routes.dashboard);
  const direction = (await searchParams).direction === "sale" ? "sale" : "purchase";
  return (
    <DashboardPage
      title="Price Management"
      eyebrow="Business operations"
      description="Manage partner prices, units and notes."
    >
      <PriceManagementView
        direction={direction}
        initialData={await loadForMember(routes.priceManagement, fetchPriceNotes)}
      />
    </DashboardPage>
  );
}
