"use client";

import { Alert } from "antd";
import { useState } from "react";

import { DataTable, DataTableCell, dataTableRowClassName, OptionDropdown } from "@/components/atoms";
import { DashboardPage } from "@/components/templates";

export type DirectoryPlayer = {
  id: string;
  name: string;
  identity: string;
  detail: string;
  status: "connecting" | "connected" | "offline";
  playtimeSeconds?: number;
};

type PlayerDirectoryProps = {
  available?: boolean;
  eyebrow: string;
  showDiscordControls?: boolean;
  source: string;
  players: DirectoryPlayer[];
};

export function PlayerDirectory({ available = true, eyebrow, showDiscordControls = false, source, players }: PlayerDirectoryProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | DirectoryPlayer["status"]>("all");
  const [playtimeSort, setPlaytimeSort] = useState<"default" | "highest" | "lowest">("default");
  const connectedCount = players.filter((player) => player.status === "connected").length;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  let filteredPlayers = normalizedQuery
    ? players.filter((player) => [player.name, player.identity, player.detail, player.status].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)))
    : players;
  if (showDiscordControls && status !== "all") filteredPlayers = filteredPlayers.filter((player) => player.status === status);
  if (showDiscordControls && playtimeSort !== "default") {
    const direction = playtimeSort === "highest" ? -1 : 1;
    filteredPlayers = [...filteredPlayers].sort((left, right) => ((left.playtimeSeconds ?? 0) - (right.playtimeSeconds ?? 0)) * direction);
  }
  const columns = [
    { label: "#", className: "w-14" },
    { label: showDiscordControls ? "Discord Name" : "Player" },
    { label: showDiscordControls ? "Discord Username" : "Identity" },
    { label: showDiscordControls ? "Character Name" : "Details" },
    ...(showDiscordControls ? [{ label: "Playtime", className: "w-32" }] : []), { label: "Status", className: "w-32" },
  ];

  return (
    <DashboardPage description={`Full player list reported by ${source}, including offline members.`} eyebrow={eyebrow} title={`${source} Players`}>

      {!available ? <Alert className="mt-6" type="warning" showIcon title={`${source} player source is unavailable.`} /> : null}

      <div className="mt-[30px]">
        <DataTable code={source === "CFX" ? "CX" : "DB"} columns={columns} empty="No matching players found." summary={`${connectedCount} connected · ${players.length} total`} title="Live player log" toolbar={<div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor={`${source.toLowerCase()}-player-search`}>Search {source} players</label>
          <span className="text-[var(--color-primary-muted)]" aria-hidden="true">⌕</span>
          <input
            className="h-9 min-w-[200px] flex-1 border border-[var(--color-border)] bg-[rgba(255,255,255,.015)] px-3 text-xs text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-primary-muted)]"
            id={`${source.toLowerCase()}-player-search`}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search player, identity, details, or status"
            type="search"
            value={query}
          />
          {showDiscordControls ? (
            <>
              <OptionDropdown ariaLabel="Filter by status" onChange={(value) => setStatus(value as typeof status)} options={[{ label: "All statuses", value: "all" }, { label: "Connecting", value: "connecting" }, { label: "Connected", value: "connected" }, { label: "Offline", value: "offline" }]} value={status} />
              <OptionDropdown ariaLabel="Sort by playtime" className="min-w-[154px]" onChange={(value) => setPlaytimeSort(value as typeof playtimeSort)} options={[{ label: "Default order", value: "default" }, { label: "Playtime: highest", value: "highest" }, { label: "Playtime: lowest", value: "lowest" }]} value={playtimeSort} />
            </>
          ) : null}
          <span className="ml-auto text-xs font-black tracking-[.12em] text-[var(--color-primary-muted)] uppercase">{filteredPlayers.length} found</span>
        </div>}>
          {filteredPlayers.map((player, index) => <tr className={dataTableRowClassName} key={player.id}>
            <DataTableCell><span className="grid h-7 w-7 place-items-center border border-[rgba(217,169,80,.18)] text-xs text-[var(--color-primary-muted)]">{String(index + 1).padStart(2, "0")}</span></DataTableCell>
            <DataTableCell className="font-bold text-[var(--color-foreground)]">{player.name}</DataTableCell><DataTableCell>{player.identity}</DataTableCell><DataTableCell>{player.detail}</DataTableCell>
            {showDiscordControls ? <DataTableCell>{formatDuration(player.playtimeSeconds ?? 0)}</DataTableCell> : null}<DataTableCell><PlayerStatus status={player.status} /></DataTableCell>
          </tr>)}
        </DataTable>
      </div>
    </DashboardPage>
  );
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function PlayerStatus({ status }: { status: DirectoryPlayer["status"] }) {
  const styles = {
    connected: "text-[#78e99a] [&>i]:bg-[#57f287] [&>i]:shadow-[0_0_10px_rgba(87,242,135,.55)]",
    connecting: "text-[var(--color-primary-bright)] [&>i]:bg-[var(--color-primary)] [&>i]:shadow-[0_0_10px_rgba(242,182,61,.55)]",
    offline: "text-[var(--color-foreground-muted)] [&>i]:bg-[#777067]",
  }[status];

  return <span className={`flex items-center gap-[7px] text-xs font-black tracking-[.1em] uppercase ${styles}`}><i className="h-1.5 w-1.5 rounded-full" />{status}</span>;
}
