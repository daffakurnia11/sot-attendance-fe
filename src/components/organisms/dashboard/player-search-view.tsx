"use client";

import { Alert } from "antd";
import { useState } from "react";

import { Panel, PlayerIdentity, ResourceState, SearchField } from "@/components/atoms";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import type { DashboardData } from "@/services/dashboard";
import { fetchDashboardRoute } from "@/services/dashboard";

type Props = Readonly<{ initialData: DashboardData | null }>;

export function PlayerSearchView({ initialData }: Props) {
  const { data, stale, failed, retry, isLoading } = useLiveResource({
    initialData,
    path: "/api/dashboard",
    fetcher: fetchDashboardRoute,
  });
  const [query, setQuery] = useState("");
  const { t } = useI18n();
  const players = data?.all_cfx_players ?? [];
  const filteredPlayers = players.filter((player) => matchesPlayerName(player.name, query));

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
      {data && !data.cfx_available ? (
        <Alert
          className="mt-6"
          type="warning"
          showIcon
          title={t("{source} player source is unavailable.", { source: "CFX" })}
        />
      ) : null}
      <Panel
        className="mt-[var(--space-section)]"
        code="PS"
        title={t("FiveM player search")}
        summary={t("{connected} connected · {total} total", { connected: players.length, total: players.length })}
        toolbar={
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[var(--color-primary-muted)]" aria-hidden="true">
                ⌕
              </span>
              <SearchField
                label={t("Search members")}
                density="comfortable"
                id="player-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Search player name...")}
                type="search"
                value={query}
              />
              <span className="ml-auto whitespace-nowrap text-xs font-black tracking-[.12em] text-[var(--color-primary-muted)] uppercase">
                {t("{count} found", { count: filteredPlayers.length })}
              </span>
            </div>
          </>
        }
      >
        {filteredPlayers.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPlayers.map((player, index) => (
              <article
                className="flex min-w-0 items-center gap-3 border-b border-r border-[rgba(217,169,80,.12)] px-4 py-3"
                key={`${player.id}-${player.name}`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center border border-[rgba(217,169,80,.18)] text-xs text-[var(--color-primary-muted)]">
                  {String(index + 1).padStart(3, "0")}
                </span>
                <PlayerIdentity name={player.name} detail={`${t("Server ID")} ${player.id} · ${player.ping}ms`} />
                <i
                  aria-label={t("Connected")}
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-success)] shadow-[0_0_10px_rgba(87,242,135,.55)]"
                />
              </article>
            ))}
          </div>
        ) : (
          <p className="px-[18px] py-12 text-center text-xs text-[var(--color-foreground-muted)]">
            {t("No matching players found.")}
          </p>
        )}
      </Panel>
    </>
  );
}

/** Equivalent to a case-insensitive SQL `LIKE '%query%'` player-name filter. */
export function matchesPlayerName(playerName: string, query: string) {
  return playerName.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}
