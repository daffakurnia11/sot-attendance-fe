"use client";

import { ResourceState } from "@/components/atoms";
import { useLiveResource } from "@/hooks/use-live-resource";
import type { DashboardData } from "@/services/dashboard";
import { fetchDashboardRoute } from "@/services/dashboard";

import type { CombinedPlayer } from "./player-directory";
import { PlayerDirectory } from "./player-directory";

type Props = Readonly<{ initialData: DashboardData | null }>;

export function PlayerDirectoryLive({ initialData }: Props) {
  const { data, stale, failed, retry, isLoading } = useLiveResource({
    initialData,
    path: "/api/dashboard",
    fetcher: fetchDashboardRoute,
  });
  if (!data)
    return (
      <ResourceState
        state={isLoading ? "loading" : "unavailable"}
        message={isLoading ? "Loading data..." : "Data could not be loaded."}
        onRetry={() => void retry()}
      />
    );
  return (
    <>
      {stale || failed ? (
        <ResourceState
          state="stale"
          message={stale ? "Live updates stopped. Sign in again to resume." : "Data could not be refreshed."}
          onRetry={() => void retry()}
        />
      ) : null}
      <PlayerDirectory
        discordPresenceAvailable={data?.discord_presence_available ?? false}
        players={combinePlayerLogs(data)}
      />
    </>
  );
}

/** Builds rows only from active server visits; CFX rosters cannot change them. */
export function combinePlayerLogs(data: DashboardData | null): CombinedPlayer[] {
  if (!data) return [];
  return data.discord_players
    .filter((player) => player.status === "connecting" || player.status === "connected")
    .map((player) => ({
      id: `character-${player.cid || player.member_id}`,
      characterName: player.character_name || "-",
      discordName: player.display_name,
      discordUsername: player.username,
      discordStatus: discordPresence(player, data.discord_presence_available),
      serverUsername: player.cfx_name,
      serverCID: player.cid,
      serverID: player.server_id ?? undefined,
      serverStatus: player.status === "connected" ? "connected" : "connecting",
    }));
}

/** Keep missing activity distinct from offline or unavailable presence. */
function discordPresence(player: DashboardData["discord_players"][number], available: boolean) {
  if (!available) return "unknown" as const;
  switch (player.discord_status) {
    case "offline":
    case "invisible":
      return "offline / invisible" as const;
    case "online":
    case "idle":
    case "dnd":
      if (!player.discord_playing) return "no CR activity" as const;
      return player.discord_connecting ? ("connecting" as const) : ("connected" as const);
    default:
      return "unknown" as const;
  }
}
