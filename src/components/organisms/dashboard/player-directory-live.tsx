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
        cfxAvailable={data?.cfx_available ?? false}
        discordPresenceAvailable={data?.discord_presence_available ?? false}
        players={combinePlayerLogs(data)}
      />
    </>
  );
}

/**
 * Builds one row per player the game server has on right now.
 *
 * The game server is the only authority on who is listed. A player it reports
 * as disconnected leaves the table immediately, even while the CFX directory
 * still lists them - that directory is polled, so it lags behind an exit by up
 * to a poll interval, and honouring it would resurrect players who had already
 * left. CFX only ever fills in the ping and the slot for players the server
 * already vouches for.
 *
 * CFX is matched on the player's CFX name, which is the same
 * `server_members.username` the webhook reports, compared case-insensitively.
 */
export function combinePlayerLogs(data: DashboardData | null): CombinedPlayer[] {
  if (!data) return [];
  const liveCFXByName = new Map(data.cfx_players.map((player) => [normalizeCFXName(player.name), player]));

  const onServer: CombinedPlayer[] = data.discord_players
    .filter((player) => player.status === "connecting" || player.status === "connected")
    .map((player) => {
      const cfxKey = normalizeCFXName(player.cfx_name);
      const cfx = cfxKey ? liveCFXByName.get(cfxKey) : undefined;
      return {
        // Rows are per character now, and a character need not have a
        // members row, so the character id is what identifies one.
        id: `character-${player.cid || player.member_id}`,
        characterName: player.character_name || "-",
        discordName: player.display_name,
        discordUsername: player.username,
        discordStatus: discordPresence(player.discord_status),
        serverUsername: player.cfx_name,
        serverCID: player.cid,
        serverID: player.server_id ?? undefined,
        // The filter above leaves only these two; a visit that ended is gone.
        serverStatus: player.status === "connected" ? ("connected" as const) : ("connecting" as const),
        cfxServerID: cfx?.id,
        cfxPing: cfx?.ping,
        // The webhook reports a connection the moment it happens; the CFX
        // directory is polled and lags behind it. Absent there is still
        // catching up, not absent from the server.
        cfxStatus: cfx ? ("connected" as const) : ("polling" as const),
      };
    });

  return onServer;
}

/**
 * Discord reports five states and cannot tell offline from invisible, so a
 * member is either visible to the bot or not.
 *
 * Presence the bot could not reach at all reads invisible too: to a reader the
 * fact is the same, that this member cannot be seen. Whether the source itself
 * answered is reported once, by the banner above the table, rather than
 * repeated on every row.
 */
function discordPresence(status: DashboardData["discord_players"][number]["discord_status"]) {
  return status === "online" || status === "idle" || status === "dnd" ? ("visible" as const) : ("invisible" as const);
}

function normalizeCFXName(value: string) {
  return value.trim().toLocaleLowerCase();
}
