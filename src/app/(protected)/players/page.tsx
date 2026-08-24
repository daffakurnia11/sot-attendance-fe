import type { Metadata } from "next";

import { PlayerDirectoryLive, type PlayerSource } from "@/components/organisms";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "Player Logs" };

export default async function PlayersPage({ searchParams }: Readonly<{ searchParams: Promise<{ view?: string }> }>) {
  const requestedView = (await searchParams).view;
  const view: PlayerSource = requestedView === "cfx" ? "cfx" : "discord";

  return (
    <PlayerDirectoryLive
      combined
      eyebrow="Server presence"
      initialData={await loadDashboard()}
      source={view === "cfx" ? "CFX" : "Discord"}
    />
  );
}
