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
        discordStatus: discordPresence(player),
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

  // Whoever the roster lists that no open visit accounts for.
  //
  // Keyed off the visits that are open right now, not off every player the
  // webhook has ever reported: discord_players carries a row per server_members
  // character for all time, so keying off it suppressed anyone who had played
  // before, which is nearly everyone. CFX is the live roster, so a name on it
  // with no open visit is a player on the server whose connect event was
  // dropped - the case this exists for.
  //
  // The cost is that CFX lags an exit by up to a poll interval, so a player who
  // just left can appear here briefly. They are marked unreported and carry no
  // visit of their own - no slot, no playtime - and the next roster read drops
  // them.
  //
  // Their identity is still known: CFX reports only a name, but that name is
  // the same server_members.username the webhook stores, so the character and
  // the Discord account behind it come from the record of every character the
  // server has ever reported. Only the visit is missing, not the person.
  const knownByCFXName = new Map(
    data.discord_players
      .filter((player) => player.cfx_name)
      .map((player) => [normalizeCFXName(player.cfx_name), player]),
  );
  const accountedFor = new Set(onServer.map((player) => normalizeCFXName(player.serverUsername)).filter(Boolean));
  const cfxOnly: CombinedPlayer[] = data.cfx_players
    .filter((player) => !accountedFor.has(normalizeCFXName(player.name)))
    .map((player) => {
      const known = knownByCFXName.get(normalizeCFXName(player.name));
      return {
        id: `cfx-${player.id}`,
        characterName: known?.character_name || "-",
        discordName: known?.display_name || "-",
        discordUsername: known?.username ?? "",
        discordStatus: known ? discordPresence(known) : ("invisible" as const),
        // The stored spelling where there is one: CFX reports whatever the
        // player set, and server_members holds what the game server sent.
        serverUsername: known?.cfx_name || player.name,
        serverCID: known?.cid ?? "",
        // Deliberately no server_id: the slot belongs to a visit, and the
        // webhook never opened one for this player.
        serverID: undefined,
        serverStatus: "unreported" as const,
        cfxServerID: player.id,
        cfxPing: player.ping,
        cfxStatus: "connected" as const,
      };
    });

  return [...onServer, ...cfxOnly];
}

/**
 * What Discord can see of this member on the server.
 *
 * The activity is the answer, not the presence status: a member shown online
 * but playing something else is not on this server, and one shown dnd while the
 * activity names the server is. The activity also says which phase they are in,
 * so the column separates joining from arrived the way the server column does.
 *
 * Everything else reads invisible, including presence the bot could not reach:
 * to the reader all of it is the one fact, that Discord is not showing this
 * person on the server. The banner above the table is what says whether the
 * source answered at all.
 */
function discordPresence(player: DashboardData["discord_players"][number]) {
  if (!player.discord_playing) return "invisible" as const;
  return player.discord_connecting ? ("connecting" as const) : ("connected" as const);
}

function normalizeCFXName(value: string) {
  return value.trim().toLocaleLowerCase();
}
