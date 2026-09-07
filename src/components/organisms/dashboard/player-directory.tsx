"use client";

import { Alert } from "antd";
import { useState } from "react";

import { DataTable, DataTableCell, dataTableRowClassName } from "@/components/atoms";
import { DashboardPage } from "@/components/templates";
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
  cfxServerID?: number;
  cfxPing?: number;
  cfxStatus: CFXStatus;
};

/**
 * Discord cannot distinguish offline from invisible, so a present member reads
 * connected and an absent one invisible. "unknown" is a third thing: live
 * presence never arrived, so the column has nothing of its own to report.
 *
 * It keeps its own state (and its own hollow dot) rather than collapsing into
 * invisible, because the two arrive by different paths and only one of them is
 * an actual answer from Discord. Both READ as "Invisible" to the member: from
 * the reader's side "Discord is not showing this person" is the same fact
 * either way, and a bare "Unknown" told them nothing they could act on.
 */
// Discord presence is about being seen, not about being attached to anything,
// so the states are visible and invisible: "connected" belonged to the server
// and CFX columns and read as a third kind of connection here.
//
// Discord cannot tell offline from invisible, and presence the bot could not
// reach is invisible too - from a reader's side all three are the same fact,
// that this member cannot be seen. The banner above the table is what says
// whether the source itself was reachable.
type DiscordStatus = "visible" | "invisible";
/** A visit is connecting or connected; once it ends the row leaves the table. */
type ServerStatus = "connecting" | "connected";
/** Polling means on the server but not yet in the polled CFX directory. */
type CFXStatus = "connected" | "polling";

type PlayerPresenceStatus = DiscordStatus | ServerStatus | CFXStatus;

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
  cfxAvailable = true,
  discordPresenceAvailable = true,
  eyebrow,
  players,
}: {
  cfxAvailable?: boolean;
  discordPresenceAvailable?: boolean;
  eyebrow: string;
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
  const discordConnected = players.filter((player) => player.discordStatus === "visible").length;
  const cfxConnected = players.filter((player) => player.cfxStatus === "connected").length;

  return (
    <DashboardPage
      description={t("Players on the CR Roleplay server now, with their Discord and CFX status.")}
      eyebrow={eyebrow}
      title={t("Player Logs")}
    >
      {!cfxAvailable ? (
        <Alert
          className="mt-6"
          type="warning"
          showIcon
          title={t("{source} player source is unavailable.", { source: "CFX" })}
        />
      ) : null}
      {!discordPresenceAvailable ? (
        <Alert
          className="mt-6"
          type="warning"
          showIcon
          title={t("{source} player source is unavailable.", { source: "Discord" })}
        />
      ) : null}
      <div className="mt-[30px]">
        <DataTable
          code="PL"
          columns={[
            { label: "#", className: "w-14" },
            { label: t("Character Name") },
            { key: "discord-status", label: t("Discord Status"), className: "w-56" },
            { key: "server-status", label: t("Server Status"), className: "w-80" },
            { key: "cfx-status", label: t("CFX Status"), className: "w-40" },
          ]}
          empty={t("No matching players found.")}
          summary={`${discordConnected} Discord · ${cfxConnected} CFX · ${players.length} total`}
          title={t("Live player log")}
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor="combined-player-search">
                {t("Search members")}
              </label>
              <span className="text-[var(--color-primary-muted)]" aria-hidden="true">
                ⌕
              </span>
              <input
                className="h-9 min-w-[200px] flex-1 border border-[var(--color-border)] bg-[rgba(255,255,255,.015)] px-3 text-xs text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-primary-muted)]"
                id="combined-player-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search character, Discord, or CFX name"
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
              {/* Each status cell leads with its pill, so all three start at
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
              <DataTableCell>
                <PlayerStatus status={player.cfxStatus} />
                {player.cfxStatus === "connected" ? (
                  <span className="mt-1 block text-[10px] text-[var(--color-foreground-muted)]">
                    {player.cfxPing}ms
                  </span>
                ) : null}
              </DataTableCell>
            </tr>
          ))}
        </DataTable>
      </div>
    </DashboardPage>
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
  const styles = {
    connected: "text-[#78e99a] [&>i]:bg-[#57f287] [&>i]:shadow-[0_0_10px_rgba(87,242,135,.55)]",
    visible: "text-[#78e99a] [&>i]:bg-[#57f287] [&>i]:shadow-[0_0_10px_rgba(87,242,135,.55)]",
    connecting: "text-[var(--color-primary-bright)] [&>i]:bg-[var(--color-primary)]",
    polling: "text-[var(--color-primary-bright)] [&>i]:bg-[var(--color-primary)]",
    invisible: "text-[var(--color-foreground-muted)] [&>i]:bg-[#777067]",
  }[status];
  // Every state goes through the dictionary, which holds each one lowercase and
  // lets the CSS uppercase it. Three of these were hardcoded English and only
  // the two older ones were ever translated.
  const label = translate(status);
  return (
    <span className={`flex shrink-0 items-center gap-[7px] text-xs font-black tracking-[.1em] uppercase ${styles}`}>
      <i className="h-1.5 w-1.5 rounded-full" />
      {label}
    </span>
  );
}
