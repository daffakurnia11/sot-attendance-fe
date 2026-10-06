"use client";

import { Alert } from "antd";
import { useState } from "react";

import { DataTable, DataTableCell, dataTableRowClassName, SearchField, StatusIndicator } from "@/components/atoms";
import { useI18n } from "@/i18n";

export type CombinedPlayer = {
  id: string;
  characterName: string;
  /** Discord identity: display name, then the handle beneath it. */
  discordName: string;
  discordUsername: string;
  discordStatus: DiscordStatus;
  /** What the game server reported: the CFX name it knows them by, their
   * character id, and the slot they hold while the visit is open. */
  serverUsername: string;
  serverCID: string;
  serverID?: string;
  serverStatus: ServerStatus;
};

/** Discord reports invisible accounts as offline; missing activity is separate. */
type DiscordStatus = "connecting" | "connected" | "offline / invisible" | "no CR activity" | "unknown";
type ServerStatus = "connecting" | "connected";

type PlayerPresenceStatus = DiscordStatus | ServerStatus;

const statusPriority: Record<ServerStatus, number> = {
  connected: 0,
  connecting: 1,
};

export function sortCombinedPlayers(players: CombinedPlayer[]) {
  return [...players].sort((left, right) => {
    return (
      statusPriority[left.serverStatus] - statusPriority[right.serverStatus] ||
      left.characterName.localeCompare(right.characterName) ||
      left.id.localeCompare(right.id, undefined, { numeric: true })
    );
  });
}

export function PlayerDirectory({
  discordPresenceAvailable = true,
  players,
}: {
  discordPresenceAvailable?: boolean;
  players: CombinedPlayer[];
}) {
  const [query, setQuery] = useState("");
  const { t } = useI18n();
  const normalizedQuery = query.trim().toLocaleLowerCase();
  let filteredPlayers = normalizedQuery
    ? players.filter((player) =>
        [
          player.characterName,
          player.discordName,
          player.discordUsername,
          player.serverUsername,
          player.serverCID,
        ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
      )
    : players;
  filteredPlayers = sortCombinedPlayers(filteredPlayers);
  const discordConnected = players.filter((player) => player.discordStatus === "connected").length;

  return (
    <>
      {!discordPresenceAvailable ? (
        <Alert
          className="mt-6"
          type="warning"
          showIcon
          title={t("{source} player source is unavailable.", { source: "Discord" })}
        />
      ) : null}
      <div className="mt-[var(--space-section)]">
        <DataTable
          code="PL"
          columns={[
            { label: "#", className: "w-14" },
            { label: t("Character Name") },
            { key: "discord-status", label: t("Discord Status"), className: "w-56" },
            { key: "server-status", label: t("Server Status"), className: "w-80" },
          ]}
          empty={t("No matching players found.")}
          summary={`${discordConnected} Discord · ${players.length} total`}
          title={t("Live player log")}
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[var(--color-primary-muted)]" aria-hidden="true">
                ⌕
              </span>
              <SearchField
                label={t("Search members")}
                density="comfortable"
                id="combined-player-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Search character, Discord, or server name")}
                type="search"
                value={query}
              />
              <span className="ml-auto text-xs font-black tracking-[.12em] text-[var(--color-primary-muted)] uppercase">
                {t("{count} found", { count: filteredPlayers.length })}
              </span>
            </div>
          }
        >
          {filteredPlayers.map((player, index) => (
            <tr className={dataTableRowClassName} key={player.id}>
              <DataTableCell>
                <span className="grid h-7 w-7 place-items-center border border-[rgba(217,169,80,.18)] text-xs text-[var(--color-primary-muted)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </DataTableCell>
              <DataTableCell className="font-bold text-[var(--color-foreground)]">{player.characterName}</DataTableCell>
              {/* Each status cell leads with its pill, so both start at
                  their column's left edge and align down the table. Leading
                  with the identifier put every pill at a different x and there
                  was no column of statuses left to scan. The identifier it
                  qualifies sits on one muted line beneath. */}
              <DataTableCell>
                <PlayerStatus status={player.discordStatus} />
                <span className="mt-1 block truncate text-[10px] text-[var(--color-foreground-muted)]">
                  {discordIdentity(player) || "-"}
                </span>
              </DataTableCell>
              <DataTableCell>
                <PlayerStatus status={player.serverStatus} />
                <span className="mt-1 block truncate text-[10px] text-[var(--color-foreground-muted)]">
                  {serverIdentity(player) || "-"}
                </span>
              </DataTableCell>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  );
}

/**
 * Always both the display name and the handle, even when the display name
 * repeats the character name. Suppressing the repeat made the column
 * inconsistent between rows, which reads as missing data rather than as tidy.
 */
function discordIdentity(player: CombinedPlayer) {
  const handle = player.discordUsername ? `@${player.discordUsername}` : "";
  return [player.discordName, handle].filter((value) => value && value !== "-").join(" · ");
}

function serverIdentity(player: CombinedPlayer) {
  return [player.serverUsername, player.serverCID, player.serverID ? `ID ${player.serverID}` : ""]
    .filter(Boolean)
    .join(" · ");
}

function PlayerStatus({ status }: { status: PlayerPresenceStatus }) {
  const { translate } = useI18n();
  const tone =
    status === "connected" ? "success" : status === "offline / invisible" || status === "unknown" ? "muted" : "warning";
  return <StatusIndicator tone={tone}>{translate(status)}</StatusIndicator>;
}
