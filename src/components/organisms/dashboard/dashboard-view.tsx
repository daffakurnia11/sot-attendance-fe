"use client";

import { ResourceState, SectionHeader, StatisticsSection } from "@/components/atoms";
import { useLiveResource } from "@/hooks/use-live-resource";
import { useI18n } from "@/i18n";
import type { DashboardData } from "@/services/dashboard";
import { fetchDashboardRoute } from "@/services/dashboard";

import { MemberStatistics, type MemberStatisticsProps } from "./member-statistics";
import { PlayerDirectory } from "./player-directory";
import { combinePlayerLogs } from "./player-directory-live";

export function DashboardView({
  data: initialData,
  statistics,
}: {
  data: DashboardData | null;
  statistics: MemberStatisticsProps;
}) {
  const { t } = useI18n();
  const { data, stale, failed, retry, isLoading } = useLiveResource({
    initialData,
    path: "/api/dashboard",
    fetcher: fetchDashboardRoute,
  });
  if (!data)
    return (
      <ResourceState
        state={isLoading ? "loading" : "unavailable"}
        message={isLoading ? "Loading data..." : "Dashboard data could not be loaded. Try refreshing the page."}
        onRetry={() => void retry()}
      />
    );

  const onlineDiscordPlayers = data.discord_players.filter((player) => player.status === "connected");
  const sotStats = [
    {
      label: t("Discord bot players"),
      value: `${onlineDiscordPlayers.length} / ${data.player_threshold}`,
      note: t("Live state from bot activity logs"),
    },
    { label: t("Total members"), value: String(data.total_members), note: t("Registered Discord members") },
  ];

  return (
    <>
      {/* Refreshing has stopped, so say so rather than presenting frozen
          numbers as live. */}
      {stale || failed ? (
        <ResourceState
          state="stale"
          message={stale ? "Live updates stopped. Sign in again to resume." : "Data could not be refreshed."}
          onRetry={() => void retry()}
        />
      ) : null}
      <StatisticsSection index="01" title="SOT Statistics" items={sotStats} />
      <MemberStatistics {...statistics} index="02" />
      <section className="mt-[var(--space-section)]">
        <SectionHeader index="03" eyebrow="Server presence" title="Logs" />
        <PlayerDirectory discordPresenceAvailable={data.discord_presence_available} players={combinePlayerLogs(data)} />
      </section>
    </>
  );
}
