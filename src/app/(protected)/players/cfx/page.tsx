import type { Metadata } from "next";

import { PlayerDirectory } from "@/components/organisms";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "CFX Players" };

export default async function CFXPlayersPage() {
  const data = await loadDashboard();

  return <PlayerDirectory available={data?.cfx_available ?? false} eyebrow="FiveM server presence" source="CFX" players={(data?.cfx_players ?? []).map((player) => ({ id: String(player.id), name: player.name, identity: `Server ID ${player.id}`, detail: `${player.ping}ms ping`, status: "connected" }))} />;
}
