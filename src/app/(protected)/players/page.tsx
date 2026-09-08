import type { Metadata } from "next";

import { PlayerDirectoryLive } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "Player Logs" };

export default async function PlayersPage() {
  return (
    <DashboardPage
      title="Player Logs"
      eyebrow="Server presence"
      description="Players on the CR Roleplay server now, with their Discord and CFX status."
    >
      <PlayerDirectoryLive initialData={await loadDashboard()} />
    </DashboardPage>
  );
}
