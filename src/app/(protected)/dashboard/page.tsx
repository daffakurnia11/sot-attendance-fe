import type { Metadata } from "next";

import { DashboardView } from "@/components/organisms";
import { DashboardPage as DashboardPageLayout } from "@/components/templates";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = await loadDashboard();

  return (
    <DashboardPageLayout description="Attendance and FiveM activity summary." eyebrow="Member overview" title="Dashboard">
      <DashboardView data={data} />
    </DashboardPageLayout>
  );
}
