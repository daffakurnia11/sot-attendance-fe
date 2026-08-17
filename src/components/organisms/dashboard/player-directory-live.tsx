"use client";

import { useLiveResource } from "@/hooks/use-live-resource";
import type { DashboardData } from "@/services/dashboard";
import { fetchDashboardRoute } from "@/services/dashboard";

import type { DirectoryPlayer } from "./player-directory";
import { PlayerDirectory } from "./player-directory";

type Props = Readonly<{
  eyebrow: string;
  initialData: DashboardData | null;
  source: "CFX" | "Discord";
}>;

/**
 * Keeps a player directory current.
 *
 * The mapping to rows lives here rather than in the page, because a refreshed
 * snapshot has to be mapped again: doing it server-side would freeze the rows
 * at whatever the first render produced.
 */
export function PlayerDirectoryLive({ eyebrow, initialData, source }: Props) {
  const { data } = useLiveResource({ initialData, path: "/api/dashboard", fetcher: fetchDashboardRoute });

  return source === "CFX"
    ? <PlayerDirectory available={data?.cfx_available ?? false} eyebrow={eyebrow} players={toCFXRows(data)} source="CFX" />
    : <PlayerDirectory eyebrow={eyebrow} players={toDiscordRows(data)} showDiscordControls source="Discord" />;
}

function toCFXRows(data: DashboardData | null): DirectoryPlayer[] {
  return (data?.cfx_players ?? []).map((player) => ({
    id: String(player.id),
    name: player.name,
    identity: `Server ID ${player.id}`,
    detail: `${player.ping}ms ping`,
    status: "connected",
  }));
}

function toDiscordRows(data: DashboardData | null): DirectoryPlayer[] {
  return (data?.discord_players ?? []).map((player) => ({
    id: String(player.member_id),
    name: player.display_name,
    identity: `@${player.username}`,
    detail: player.character_name || "-",
    status: player.status as DirectoryPlayer["status"],
    playtimeSeconds: player.total_playtime_seconds,
  }));
}
