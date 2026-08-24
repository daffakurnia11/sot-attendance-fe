"use client";

import { Alert } from "antd";
import { useState } from "react";

import { DataTable, DataTableCell, dataTableRowClassName, OptionDropdown } from "@/components/atoms";
import { DashboardPage } from "@/components/templates";
import { useI18n } from "@/i18n";

import { PlayerSourceTabs } from "./player-source-tabs";

export type DirectoryPlayer = {
  id: string;
  name: string;
  identity: string;
  detail: string;
  status: "connecting" | "connected" | "offline";
  playtimeSeconds?: number;
};

const statusPriority: Record<DirectoryPlayer["status"], number> = {
  connected: 0,
  connecting: 1,
  offline: 2,
};

export function sortDirectoryPlayers(
  players: DirectoryPlayer[],
  source: "CFX" | "Discord",
  playtimeSort: "default" | "highest" | "lowest",
) {
  if (playtimeSort !== "default") {
    const direction = playtimeSort === "highest" ? -1 : 1;
    return [...players].sort((left, right) => {
      const difference = ((left.playtimeSeconds ?? 0) - (right.playtimeSeconds ?? 0)) * direction;
      return difference || left.id.localeCompare(right.id, undefined, { numeric: true });
    });
  }

  return [...players].sort((left, right) => {
    if (source === "CFX")
      return Number(left.id) - Number(right.id) || left.id.localeCompare(right.id, undefined, { numeric: true });

    return (
      statusPriority[left.status] - statusPriority[right.status] ||
      left.name.localeCompare(right.name) ||
      left.id.localeCompare(right.id, undefined, { numeric: true })
    );
  });
}

type PlayerDirectoryProps = {
  available?: boolean;
  combined?: boolean;
  eyebrow: string;
  showDiscordControls?: boolean;
  source: "CFX" | "Discord";
  players: DirectoryPlayer[];
};

export function PlayerDirectory({
  available = true,
  combined = false,
  eyebrow,
  showDiscordControls = false,
  source,
  players,
}: PlayerDirectoryProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | DirectoryPlayer["status"]>("all");
  const [playtimeSort, setPlaytimeSort] = useState<"default" | "highest" | "lowest">("default");
  const { t } = useI18n();
  const connectedCount = players.filter((player) => player.status === "connected").length;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  let filteredPlayers = normalizedQuery
    ? players.filter((player) =>
        [player.name, player.identity, player.detail, player.status].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
      )
    : players;
  if (showDiscordControls && status !== "all")
    filteredPlayers = filteredPlayers.filter((player) => player.status === status);
  filteredPlayers = sortDirectoryPlayers(filteredPlayers, source, playtimeSort);
  const columns = [
    { label: "#", className: "w-14" },
    { label: showDiscordControls ? t("Discord Name") : t("Player") },
    { label: showDiscordControls ? t("Discord Username") : t("Identity") },
    { label: showDiscordControls ? t("Character Name") : t("Details") },
    ...(showDiscordControls ? [{ label: t("Playtime"), className: "w-32" }] : []),
    { label: t("Status"), className: "w-32" },
  ];

  return (
    <DashboardPage
      description={
        combined
          ? t("Live Discord and CFX player presence.")
          : t("Full player list reported by {source}, including offline members.", { source })
      }
      eyebrow={eyebrow}
      title={combined ? t("Player Logs") : `${source} Players`}
    >
      {combined ? <PlayerSourceTabs active={source === "CFX" ? "cfx" : "discord"} /> : null}
      {!available ? (
        <Alert
          className="mt-6"
          type="warning"
          showIcon
          title={t("{source} player source is unavailable.", { source })}
        />
      ) : null}

      <div className="mt-[30px]">
        <DataTable
          code={source === "CFX" ? "CX" : "DB"}
          columns={columns}
          empty={t("No matching players found.")}
          summary={t("{connected} connected · {total} total", { connected: connectedCount, total: players.length })}
          title={t("Live player log")}
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor={`${source.toLowerCase()}-player-search`}>
                {t("Search {source} players", { source })}
              </label>
              <span className="text-[var(--color-primary-muted)]" aria-hidden="true">
                ⌕
              </span>
              <input
                className="h-9 min-w-[200px] flex-1 border border-[var(--color-border)] bg-[rgba(255,255,255,.015)] px-3 text-xs text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-primary-muted)]"
                id={`${source.toLowerCase()}-player-search`}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Search player, identity, details, or status")}
                type="search"
                value={query}
              />
              {showDiscordControls ? (
                <>
                  <OptionDropdown
                    ariaLabel={t("Filter by status")}
                    onChange={(value) => setStatus(value as typeof status)}
                    options={[
                      { label: t("All statuses"), value: "all" },
                      { label: t("Connecting"), value: "connecting" },
                      { label: t("Connected"), value: "connected" },
                      { label: t("Offline"), value: "offline" },
                    ]}
                    value={status}
                  />
                  <OptionDropdown
                    ariaLabel={t("Sort by playtime")}
                    className="min-w-[154px]"
                    onChange={(value) => setPlaytimeSort(value as typeof playtimeSort)}
                    options={[
                      { label: t("Default order"), value: "default" },
                      { label: t("Playtime: highest"), value: "highest" },
                      { label: t("Playtime: lowest"), value: "lowest" },
                    ]}
                    value={playtimeSort}
                  />
                </>
              ) : null}
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
              <DataTableCell className="font-bold text-[var(--color-foreground)]">{player.name}</DataTableCell>
              <DataTableCell>{player.identity}</DataTableCell>
              <DataTableCell>{player.detail}</DataTableCell>
              {showDiscordControls ? (
                <DataTableCell>{formatDuration(player.playtimeSeconds ?? 0)}</DataTableCell>
              ) : null}
              <DataTableCell>
                <PlayerStatus status={player.status} />
              </DataTableCell>
            </tr>
          ))}
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
  const { translate } = useI18n();
  const styles = {
    connected: "text-[#78e99a] [&>i]:bg-[#57f287] [&>i]:shadow-[0_0_10px_rgba(87,242,135,.55)]",
    connecting:
      "text-[var(--color-primary-bright)] [&>i]:bg-[var(--color-primary)] [&>i]:shadow-[0_0_10px_rgba(242,182,61,.55)]",
    offline: "text-[var(--color-foreground-muted)] [&>i]:bg-[#777067]",
  }[status];

  return (
    <span className={`flex items-center gap-[7px] text-xs font-black tracking-[.1em] uppercase ${styles}`}>
      <i className="h-1.5 w-1.5 rounded-full" />
      {translate(status)}
    </span>
  );
}
