"use client";

import { Alert } from "antd";
import { useRef, useState } from "react";

import { DataTable, DataTableCell, dataTableRowClassName, OptionDropdown, SectionHeader, StatisticCard } from "@/components/atoms";
import { DashboardPage } from "@/components/templates";
import { useI18n } from "@/i18n";
import type { PayslipReport, PayslipSort } from "@/services/payslip";
import { sortPayslipPlayers } from "@/services/payslip";

export function PayslipView({ initialData }: { initialData: PayslipReport | null }) {
  const [report, setReport] = useState(initialData);
  const [query, setQuery] = useState("");
  const [eligibility, setEligibility] = useState<"all" | "eligible" | "ineligible">("all");
  const [sort, setSort] = useState<PayslipSort>("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(!initialData);
  const requestController = useRef<AbortController | null>(null);
  const { locale, t } = useI18n();

  async function changeMonth(offset: number) {
    if (!report) return;
    const target = shiftMonth(report.month, offset);
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/payslips?month=${encodeURIComponent(target)}`, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("request failed");
      setReport(await response.json() as PayslipReport);
    } catch (requestError) {
      if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError(true);
    } finally {
      if (requestController.current === controller) setLoading(false);
    }
  }

  if (!report) return <div className="w-full px-3.5 pt-6 sm:px-6 sm:pt-[30px]"><Alert type="error" showIcon title={t("Payslip data could not be loaded.")} /></div>;

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = report.players.filter((player) => {
    const matchesQuery = !normalizedQuery || [player.character_name, player.display_name, player.username].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
    const matchesEligibility = eligibility === "all" || (eligibility === "eligible" ? player.eligible : !player.eligible);
    return matchesQuery && matchesEligibility;
  });
  const players = sortPayslipPlayers(filtered, sort);
  const toolbar = <div className="flex flex-wrap items-center gap-3">
    <label className="sr-only" htmlFor="payslip-search">{t("Search players")}</label>
    <input aria-label={t("Search players...")} className="h-10 min-w-[220px] flex-1 border border-[var(--color-border)] bg-[rgba(255,255,255,.015)] px-3 text-base outline-none placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-primary-muted)]" id="payslip-search" onChange={(event) => setQuery(event.target.value)} placeholder={t("Search players...")} type="search" value={query} />
    <OptionDropdown ariaLabel={t("Filter by eligibility")} className="min-w-[154px]" onChange={(value) => setEligibility(value as typeof eligibility)} options={[{ label: t("All eligibility"), value: "all" }, { label: t("Eligible"), value: "eligible" }, { label: t("Not eligible"), value: "ineligible" }]} value={eligibility} />
    <OptionDropdown ariaLabel={t("Sort payslips")} className="min-w-[176px]" onChange={(value) => setSort(value as PayslipSort)} options={[{ label: t("Default order"), value: "default" }, { label: t("Attendance: highest"), value: "attendance-desc" }, { label: t("Attendance: lowest"), value: "attendance-asc" }, { label: t("Payslip: highest"), value: "payslip-desc" }, { label: t("Payslip: lowest"), value: "payslip-asc" }]} value={sort} />
    <div className="ml-auto flex items-center gap-2"><button aria-label={t("Previous month")} className="grid h-9 w-9 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:opacity-40" disabled={loading} onClick={() => void changeMonth(-1)} type="button">‹</button><strong className="min-w-[170px] text-center text-sm tracking-[.06em] uppercase">{formatPeriod(report.period_start, report.period_end, locale)}</strong><button aria-label={t("Next month")} className="grid h-9 w-9 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:opacity-40" disabled={loading} onClick={() => void changeMonth(1)} type="button">›</button></div>
  </div>;

  return <DashboardPage description="Monthly eligibility and equal contract distribution across qualified members." eyebrow="Member payments" title="Payslip Recap">
    <section className="mt-[30px]"><SectionHeader eyebrow={t("Overview")} index="01" title={t("Payslip Statistics")} /><div className="mt-3 grid gap-3 md:grid-cols-3"><StatisticCard index={1} label={t("Payment Contract")} note={t("Shared equally by eligible players")} value={formatRupiah(report.payment_contract)} /><StatisticCard index={2} label={t("Eligible Players")} note={t("Minimum {count} attendance days", { count: report.attendance_minimum })} value={`${report.eligible_players} / ${report.total_players}`} /><StatisticCard index={3} label={t("Total Payout")} note={t("Total after Rp. 1,000 round-down per player")} value={formatRupiah(report.total_payout)} /></div></section>
    {error ? <Alert className="mt-4" type="error" showIcon title={t("Could not load selected month.")} /> : null}
    <div className={`mt-4 transition-opacity ${loading ? "opacity-45" : "opacity-100"}`} aria-busy={loading}>
      <DataTable code="PR" columns={[{ label: "#" }, { label: "Character Name" }, { label: "Discord" }, { label: "Attendance" }, { label: "Eligibility" }, { label: "Payslip" }]} empty={t("No matching players found.")} summary={t("{count} found", { count: players.length })} title={t("Payslip Calculation")} toolbar={toolbar}>
        {players.map((player, index) => <tr className={dataTableRowClassName} key={player.member_id}><DataTableCell className="text-[var(--color-primary-muted)]">{String(index + 1).padStart(2, "0")}</DataTableCell><DataTableCell className="font-bold text-[var(--color-foreground)]">{player.character_name || "-"}</DataTableCell><DataTableCell><span className="block text-[var(--color-foreground)]">{player.display_name}</span><span className="text-[var(--color-foreground-muted)]">@{player.username}</span></DataTableCell><DataTableCell>{t("{attended} / {maximum} days", { attended: player.attended_days, maximum: report.attendance_maximum })}</DataTableCell><DataTableCell><span className={player.eligible ? "text-[#55dfbd]" : "text-[#ef7474]"}>{player.eligible ? t("ELIGIBLE") : t("MIN. {count} DAYS", { count: report.attendance_minimum })}</span></DataTableCell><DataTableCell className="font-bold text-[var(--color-primary-bright)]">{formatRupiah(player.payout)}</DataTableCell></tr>)}
      </DataTable>
    </div>
  </DashboardPage>;
}

function shiftMonth(month: string, offset: number) { const date = new Date(`${month}-01T00:00:00Z`); date.setUTCMonth(date.getUTCMonth() + offset); return date.toISOString().slice(0, 7); }
function formatPeriod(start: string, end: string, locale: "en" | "id") { const formatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); return `${formatter.format(new Date(`${start}T00:00:00Z`))} – ${formatter.format(new Date(`${end}T00:00:00Z`))}`; }
function formatRupiah(value: string) { return `Rp. ${new Intl.NumberFormat("id-ID").format(BigInt(value))}`; }
