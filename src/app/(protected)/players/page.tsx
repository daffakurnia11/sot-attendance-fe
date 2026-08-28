import type { Metadata } from "next";

import { PlayerDirectoryLive } from "@/components/organisms";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "Player Logs" };

export default async function PlayersPage() {
  return <PlayerDirectoryLive eyebrow="Server presence" initialData={await loadDashboard()} />;
}
