"use client";

import { useLiveResource } from "@/hooks/use-live-resource";
import type { DashboardData } from "@/services/dashboard";
import { fetchDashboardRoute } from "@/services/dashboard";

import type { CombinedPlayer } from "./player-directory";
import { PlayerDirectory } from "./player-directory";

type Props = Readonly<{ eyebrow: string; initialData: DashboardData | null }>;

export function PlayerDirectoryLive({ eyebrow, initialData }: Props) {
  const { data } = useLiveResource({ initialData, path: "/api/dashboard", fetcher: fetchDashboardRoute });
  return <PlayerDirectory cfxAvailable={data?.cfx_available ?? false} eyebrow={eyebrow} players={combinePlayerLogs(data)} />;
}

export function combinePlayerLogs(data: DashboardData | null): CombinedPlayer[] {
  if (!data) return [];
  const liveCFXByName = new Map(data.cfx_players.map((player) => [normalizeCFXName(player.name), player]));
  const matchedCFXNames = new Set<string>();
  const members: CombinedPlayer[] = data.discord_players.map((player) => {
    const cfxKey = normalizeCFXName(player.cfx_name);
    const cfx = cfxKey ? liveCFXByName.get(cfxKey) : undefined;
    if (cfx) matchedCFXNames.add(cfxKey);
    return {
      id: `member-${player.member_id}`,
      characterName: player.character_name || "-",
      discordName: player.display_name,
      discordUsername: player.username,
      discordStatus: cfx && player.status === "offline" ? "invisible" : player.status,
      cfxName: player.cfx_name,
      cfxServerID: cfx?.id,
      cfxPing: cfx?.ping,
      cfxConnected: Boolean(cfx),
      cfxStatus: cfx ? "connected" : player.cfx_name ? "mismatched" : "not_set",
      playtimeSeconds: player.current_playtime_seconds,
    };
  });
  const unmatchedCFX: CombinedPlayer[] = data.cfx_players
    .filter((player) => !matchedCFXNames.has(normalizeCFXName(player.name)))
    .map((player) => ({
      id: `cfx-${player.id}`,
      characterName: "-",
      discordName: "-",
      discordUsername: "",
      discordStatus: "mismatched",
      cfxName: player.name,
      cfxServerID: player.id,
      cfxPing: player.ping,
      cfxConnected: true,
      cfxStatus: "connected",
      playtimeSeconds: 0,
    }));
  return [...members.filter((player) => player.cfxConnected || player.discordStatus !== "offline"), ...unmatchedCFX];
}

function normalizeCFXName(value: string) {
  return value.trim().toLocaleLowerCase();
}
