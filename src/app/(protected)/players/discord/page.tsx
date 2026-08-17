import type { Metadata } from "next";

import { PlayerDirectoryLive } from "@/components/organisms";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "Discord Players" };

export default async function DiscordPlayersPage() {
  // Rendered server-side for first paint; PlayerDirectoryLive keeps it current.
  return <PlayerDirectoryLive eyebrow="Discord bot presence" initialData={await loadDashboard()} source="Discord" />;
}
