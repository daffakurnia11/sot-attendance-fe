"use client";

import { Alert } from "antd";
import { useState } from "react";

import { DashboardPage } from "@/components/templates";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import type { DashboardData } from "@/services/dashboard";
import { fetchDashboardRoute } from "@/services/dashboard";

type Props = Readonly<{ initialData: DashboardData | null }>;

export function PlayerSearchView({ initialData }: Props) {
  const { data } = useLiveResource({ initialData, path: "/api/dashboard", fetcher: fetchDashboardRoute });
  const [query, setQuery] = useState("");
  const { t } = useI18n();
  const players = data?.all_cfx_players ?? [];
  const filteredPlayers = players.filter((player) => matchesPlayerName(player.name, query));

  return (
    <DashboardPage
      description={t("Search every player currently reported by the FiveM server.")}
      eyebrow={t("Server presence")}
      title={t("Player Search")}
    >
      {data && !data.cfx_available ? (
        <Alert
          className="mt-6"
          type="warning"
          showIcon
          title={t("{source} player source is unavailable.", { source: "CFX" })}
        />
      ) : null}
      <section className="mt-[30px] overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(145deg,rgba(242,182,61,.055),rgba(255,255,255,.01))] shadow-[inset_0_3px_0_rgba(242,182,61,.2)]">
        <header className="flex min-h-[52px] flex-col items-start justify-between gap-2 border-b border-[var(--color-border)] px-[18px] py-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-[11px] uppercase">
            <span className="grid h-[30px] w-[30px] place-items-center border border-[var(--color-border)] text-xs font-black text-[var(--color-primary)]">
              PS
            </span>
            <h2 className="font-[Impact] text-[22px] font-normal tracking-[.04em] uppercase">
              {t("FiveM player search")}
            </h2>
          </div>
          <span className="whitespace-nowrap text-xs font-black tracking-[.14em] text-[var(--color-primary)] uppercase">
            {t("{connected} connected · {total} total", {
              connected: players.length,
              total: players.length,
            })}
          </span>
        </header>
        <div className="border-b border-[rgba(217,169,80,.14)] px-[18px] py-2.5">
          <div className="flex items-center gap-3">
            <label className="sr-only" htmlFor="player-search">
              {t("Search player name")}
            </label>
            <span className="text-[var(--color-primary-muted)]" aria-hidden="true">
              ⌕
            </span>
            <input
              className="h-9 min-w-[200px] flex-1 border border-[var(--color-border)] bg-[rgba(255,255,255,.015)] px-3 text-xs text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-primary-muted)]"
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
        </div>
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
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-xs text-[var(--color-foreground)]">{player.name}</strong>
                  <span className="mt-1 block text-[10px] tracking-[.06em] text-[var(--color-foreground-muted)] uppercase">
                    {t("Server ID")} {player.id} · {player.ping}ms
                  </span>
                </div>
                <i
                  aria-label={t("Connected")}
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#57f287] shadow-[0_0_10px_rgba(87,242,135,.55)]"
                />
              </article>
            ))}
          </div>
        ) : (
          <p className="px-[18px] py-12 text-center text-xs text-[var(--color-foreground-muted)]">
            {t("No matching players found.")}
          </p>
        )}
      </section>
    </DashboardPage>
  );
}

/** Equivalent to a case-insensitive SQL `LIKE '%query%'` player-name filter. */
export function matchesPlayerName(playerName: string, query: string) {
  return playerName.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}
