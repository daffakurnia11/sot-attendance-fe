import type { Metadata } from "next";

import { PlayerDirectoryLive } from "@/components/organisms";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "CFX Players" };

export default async function CFXPlayersPage() {
  // Rendered server-side for first paint; PlayerDirectoryLive keeps it current.
  return <PlayerDirectoryLive eyebrow="FiveM server presence" initialData={await loadDashboard()} source="CFX" />;
}
