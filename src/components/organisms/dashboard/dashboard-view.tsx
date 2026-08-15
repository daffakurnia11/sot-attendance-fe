"use client";

import { Alert } from "antd";

import { SectionHeader, StatisticCard } from "@/components/atoms";
import type { DashboardData } from "@/services/dashboard";

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function DashboardView({ data }: { data: DashboardData | null }) {
  if (!data) return <Alert className="mt-6" type="error" showIcon title="Dashboard data could not be loaded. Try refreshing the page." />;

  const onlineDiscordPlayers = data.discord_players.filter((player) => player.status === "connected");
  const rate = data.total_attendances === 0 ? 0 : Math.round((data.total_attended / data.total_attendances) * 100);
  const sotStats = [
    { label: "Discord bot players", value: `${onlineDiscordPlayers.length} / ${data.player_threshold}`, note: "Live state from bot activity logs" },
    { label: "CFX players", value: `${data.cfx_players.length} / ${data.player_threshold}`, note: data.cfx_available ? "Live filtered CFX player list" : "CFX server unavailable" },
    { label: "Total members", value: String(data.total_members), note: "Registered Discord members" },
  ];
  const myStats = [
    { label: "Total playtime", value: formatDuration(data.total_playtime_seconds) },
    { label: "Total attended", value: String(data.total_attended) },
    { label: "Attendance rate", value: `${rate}%` },
  ];

  return (
    <>
      <DashboardSection index="01" title="SOT Statistics" items={sotStats} />
      <DashboardSection index="02" title="My Statistics" items={myStats} />
      <section className="mt-[30px]">
        <SectionHeader index="03" eyebrow="Server presence" title="Logs" />
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <PlayerList title="Discord Bot" players={onlineDiscordPlayers.map((player) => ({ name: player.display_name, detail: player.character_name || `@${player.username}` }))} />
          <PlayerList title="CFX" players={data.cfx_players.map((player) => ({ name: player.name, detail: `Server ID ${player.id} · ${player.ping}ms` }))} unavailable={!data.cfx_available} />
        </div>
      </section>
    </>
  );
}

function DashboardSection({ index, title, items }: { index: string; title: string; items: Array<{ label: string; value: string; note?: string }> }) {
  return <section className="mt-[30px]"><SectionHeader index={index} eyebrow="Overview" title={title} /><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">{items.map((item, itemIndex) => <StatisticCard index={itemIndex + 1} key={item.label} label={item.label} note={item.note} value={item.value} />)}</div></section>;
}

function PlayerList({ title, players, unavailable = false }: { title: string; players: Array<{ name: string; detail: string }>; unavailable?: boolean }) {
  return <article className="min-h-[250px] border border-[var(--color-border)] bg-[linear-gradient(145deg,rgba(242,182,61,.06),rgba(255,255,255,.01))] shadow-[inset_0_3px_0_rgba(242,182,61,.18)]"><header className="flex items-center justify-between border-b border-[var(--color-border)] px-[18px] py-3.5"><div className="flex items-center gap-2.5"><span className="grid h-[30px] w-[30px] place-items-center border border-[var(--color-border)] text-xs font-black text-[var(--color-primary)]">{title === "CFX" ? "CX" : "DB"}</span><h3 className="m-0 font-[Impact] text-[22px] font-normal tracking-[.04em] uppercase">{title}</h3></div><span className={`flex items-center gap-[7px] text-xs font-black tracking-[.12em] uppercase ${unavailable ? "text-[var(--color-foreground-muted)]" : "text-[var(--color-primary)]"}`}><i className={`h-1.5 w-1.5 rounded-full ${unavailable ? "bg-[#777067]" : "bg-[#57f287] shadow-[0_0_10px_rgba(87,242,135,.6)]"}`} />{players.length} online</span></header>{players.length ? <ul className="m-0 block max-h-[286px] list-none overflow-y-auto px-[18px] py-1.5 [scrollbar-color:var(--color-primary-muted)_rgba(242,182,61,.06)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-primary-muted)] [&::-webkit-scrollbar-track]:bg-[rgba(242,182,61,.06)]">{players.map((player, index) => <li className="flex items-center gap-3 border-b border-[rgba(217,169,80,.12)] py-3 last:border-b-0" key={`${player.name}-${player.detail}`}><span className="grid h-7 w-7 place-items-center border border-[rgba(217,169,80,.18)] text-xs text-[var(--color-primary-muted)]">{String(index + 1).padStart(2, "0")}</span><div className="flex flex-col"><strong>{player.name}</strong><small className="mt-[3px] text-xs text-[var(--color-foreground-muted)]">{player.detail}</small></div><span className="ml-auto h-2 w-2 rounded-full bg-[#57f287] shadow-[0_0_12px_rgba(87,242,135,.5)]" /></li>)}</ul> : <div className="flex min-h-[188px] flex-col items-center justify-center gap-2 text-center text-[var(--color-foreground-muted)]"><span className="grid h-[46px] w-[46px] rotate-45 place-items-center border border-[var(--color-border)] font-[Impact] text-[26px] text-[var(--color-primary-muted)]" aria-hidden="true">×</span><strong className="text-[var(--color-foreground)] uppercase">{unavailable ? "CFX unavailable" : "No players detected"}</strong><span>{unavailable ? "Could not reach FiveM server" : `${title} has no matching players`}</span></div>}</article>;
}
