"use client";

import { Alert } from "antd";
import { useState } from "react";

import { DataTable, DataTableCell, dataTableRowClassName, OptionDropdown } from "@/components/atoms";
import { DashboardPage } from "@/components/templates";
import { useI18n } from "@/i18n";

export type CombinedPlayer = {
  id: string;
  characterName: string;
  discordName: string;
  discordUsername: string;
  discordStatus: PlayerPresenceStatus;
  cfxName: string;
  cfxServerID?: number;
  cfxPing?: number;
  cfxConnected: boolean;
  cfxStatus: PlayerPresenceStatus;
  playtimeSeconds: number;
};

type PlayerPresenceStatus = "connecting" | "connected" | "offline" | "not_set" | "invisible" | "mismatched";

const statusPriority: Record<PlayerPresenceStatus, number> = { connected: 0, connecting: 1, mismatched: 2, invisible: 3, offline: 4, not_set: 5 };

export function sortCombinedPlayers(players: CombinedPlayer[], playtimeSort: "default" | "highest" | "lowest") {
  return [...players].sort((left, right) => {
    if (playtimeSort !== "default") {
      const direction = playtimeSort === "highest" ? -1 : 1;
      const difference = (left.playtimeSeconds - right.playtimeSeconds) * direction;
      if (difference) return difference;
    }
    return Number(right.cfxConnected) - Number(left.cfxConnected) || statusPriority[left.discordStatus] - statusPriority[right.discordStatus] || left.characterName.localeCompare(right.characterName) || left.id.localeCompare(right.id, undefined, { numeric: true });
  });
}

export function PlayerDirectory({ cfxAvailable = true, eyebrow, players }: { cfxAvailable?: boolean; eyebrow: string; players: CombinedPlayer[] }) {
  const [query, setQuery] = useState("");
  const [playtimeSort, setPlaytimeSort] = useState<"default" | "highest" | "lowest">("default");
  const { t } = useI18n();
  const normalizedQuery = query.trim().toLocaleLowerCase();
  let filteredPlayers = normalizedQuery ? players.filter((player) => [player.characterName, player.discordName, player.discordUsername, player.cfxName].some((value) => value.toLocaleLowerCase().includes(normalizedQuery))) : players;
  filteredPlayers = sortCombinedPlayers(filteredPlayers, playtimeSort);
  const discordConnected = players.filter((player) => player.discordStatus === "connected").length;
  const cfxConnected = players.filter((player) => player.cfxConnected).length;

  return (
    <DashboardPage description={t("Live Discord and CFX player presence.")} eyebrow={eyebrow} title={t("Player Logs")}>
      {!cfxAvailable ? <Alert className="mt-6" type="warning" showIcon title={t("{source} player source is unavailable.", { source: "CFX" })} /> : null}
      <div className="mt-[30px]">
        <DataTable
          code="PL"
          columns={[{ label: "#", className: "w-14" }, { label: t("Character Name") }, { label: t("Discord Name") }, { key: "cfx-name", label: "CFX" }, { label: t("Playtime"), className: "w-28" }, { label: "Discord", className: "w-32" }, { key: "cfx-status", label: "CFX", className: "w-32" }]}
          empty={t("No matching players found.")}
          summary={`${discordConnected} Discord · ${cfxConnected} CFX · ${players.length} total`}
          title={t("Live player log")}
          toolbar={<div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="combined-player-search">{t("Search members")}</label><span className="text-[var(--color-primary-muted)]" aria-hidden="true">⌕</span>
            <input className="h-9 min-w-[200px] flex-1 border border-[var(--color-border)] bg-[rgba(255,255,255,.015)] px-3 text-xs text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-primary-muted)]" id="combined-player-search" onChange={(event) => setQuery(event.target.value)} placeholder="Search character, Discord, or CFX name" type="search" value={query} />
            <OptionDropdown ariaLabel={t("Sort by playtime")} className="min-w-[154px]" onChange={(value) => setPlaytimeSort(value as typeof playtimeSort)} options={[{ label: t("Default order"), value: "default" }, { label: t("Playtime: highest"), value: "highest" }, { label: t("Playtime: lowest"), value: "lowest" }]} value={playtimeSort} />
            <span className="ml-auto text-xs font-black tracking-[.12em] text-[var(--color-primary-muted)] uppercase">{t("{count} found", { count: filteredPlayers.length })}</span>
          </div>}
        >
          {filteredPlayers.map((player, index) => <tr className={dataTableRowClassName} key={player.id}>
            <DataTableCell><span className="grid h-7 w-7 place-items-center border border-[rgba(217,169,80,.18)] text-xs text-[var(--color-primary-muted)]">{String(index + 1).padStart(2, "0")}</span></DataTableCell>
            <DataTableCell className="font-bold text-[var(--color-foreground)]">{player.characterName}</DataTableCell>
            <DataTableCell>{player.discordName}{player.discordUsername ? <span className="block text-[10px] text-[var(--color-foreground-muted)]">@{player.discordUsername}</span> : null}</DataTableCell>
            <DataTableCell>{player.cfxName || "Not Set"}{player.cfxConnected ? <span className="block text-[10px] text-[var(--color-foreground-muted)]">Server ID {player.cfxServerID} · {player.cfxPing}ms</span> : null}</DataTableCell>
            <DataTableCell>{formatDuration(player.playtimeSeconds)}</DataTableCell><DataTableCell><PlayerStatus status={player.discordStatus} /></DataTableCell><DataTableCell><PlayerStatus status={player.cfxStatus} /></DataTableCell>
          </tr>)}
        </DataTable>
      </div>
    </DashboardPage>
  );
}

function formatDuration(totalSeconds: number) { return `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`; }

function PlayerStatus({ status }: { status: PlayerPresenceStatus }) {
  const { translate } = useI18n();
  const styles = { connected: "text-[#78e99a] [&>i]:bg-[#57f287] [&>i]:shadow-[0_0_10px_rgba(87,242,135,.55)]", connecting: "text-[var(--color-primary-bright)] [&>i]:bg-[var(--color-primary)]", offline: "text-[var(--color-foreground-muted)] [&>i]:bg-[#777067]", not_set: "text-[var(--color-foreground-muted)] [&>i]:bg-transparent [&>i]:border [&>i]:border-[var(--color-foreground-muted)]", invisible: "text-[var(--color-foreground-muted)] [&>i]:bg-[#777067]", mismatched: "text-[#ff7474] [&>i]:bg-[#ed4245] [&>i]:shadow-[0_0_10px_rgba(237,66,69,.45)]" }[status];
  const label = status === "not_set" ? "Not Set" : status === "invisible" ? "Invisible" : status === "mismatched" ? "Mismatched" : translate(status);
  return <span className={`flex items-center gap-[7px] text-xs font-black tracking-[.1em] uppercase ${styles}`}><i className="h-1.5 w-1.5 rounded-full" />{label}</span>;
}
