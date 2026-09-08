import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PlayerSearchView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "Player Search" };

export default async function PlayerSearchPage() {
  if (!(await isAdminSession())) redirect(routes.dashboard);

  return (
    <DashboardPage
      title="Player Search"
      eyebrow="Server presence"
      description="Search every player currently reported by the FiveM server."
    >
      <PlayerSearchView initialData={await loadDashboard()} />
    </DashboardPage>
  );
}
