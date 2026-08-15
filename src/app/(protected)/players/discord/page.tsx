import type { Metadata } from "next";

import { PlayerDirectory } from "@/components/organisms";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "Discord Players" };

export default async function DiscordPlayersPage() {
  const data = await loadDashboard();

  return <PlayerDirectory eyebrow="Discord bot presence" showDiscordControls source="Discord" players={(data?.discord_players ?? []).map((player) => ({ id: String(player.member_id), name: player.display_name, identity: `@${player.username}`, detail: player.character_name || "-", status: player.status, playtimeSeconds: player.total_playtime_seconds }))} />;
}
