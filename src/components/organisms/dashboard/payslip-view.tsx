"use client";

import { useState } from "react";

import {
  DataTable,
  DataTableCell,
  dataTableRowClassName,
  OptionDropdown,
  PeriodNavigator,
  ReportExportButton,
  ResourceState,
  SearchField,
  StatisticsSection,
} from "@/components/atoms";
import { usePeriodReport } from "@/hooks/use-period-report";
import { useI18n } from "@/i18n";
import { buildPayslipSheets } from "@/lib/report-export";
import type { PayslipReport, PayslipSort } from "@/services/payslip";
import { payslipReportSchema } from "@/services/payslip";
import { sortPayslipPlayers } from "@/services/payslip";

export function PayslipView({ initialData }: { initialData: PayslipReport | null }) {
  const { report, loading, error, changeMonth, retry } = usePeriodReport({
    initialData,
    endpoint: "/api/payslips",
    schema: payslipReportSchema,
  });
  const [query, setQuery] = useState("");
  const [eligibility, setEligibility] = useState<"all" | "eligible" | "ineligible">("all");
  const [sort, setSort] = useState<PayslipSort>("default");
  const { t } = useI18n();

  if (!report)
    return (
      <ResourceState
        state={loading ? "loading" : "unavailable"}
        message={loading ? t("Loading data...") : t("Payslip data could not be loaded.")}
        onRetry={() => void retry()}
      />
    );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = report.players.filter((player) => {
    const matchesQuery =
      !normalizedQuery ||
      [player.character_name, player.display_name, player.username].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      );
    const matchesEligibility =
      eligibility === "all" || (eligibility === "eligible" ? player.eligible : !player.eligible);
    return matchesQuery && matchesEligibility;
  });
  const players = sortPayslipPlayers(filtered, sort);
  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <SearchField
        label={t("Search members")}
        density="comfortable"
        id="payslip-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("Search players...")}
        type="search"
        value={query}
      />
      <OptionDropdown
        ariaLabel={t("Filter by eligibility")}
        className="min-w-[154px]"
        onChange={(value) => setEligibility(value as typeof eligibility)}
        options={[
          { label: t("All eligibility"), value: "all" },
          { label: t("Eligible"), value: "eligible" },
          { label: t("Not eligible"), value: "ineligible" },
        ]}
        value={eligibility}
      />
      <OptionDropdown
        ariaLabel={t("Sort payslips")}
        className="min-w-[176px]"
        onChange={(value) => setSort(value as PayslipSort)}
        options={[
          { label: t("Default order"), value: "default" },
          { label: t("Attendance: highest"), value: "attendance-desc" },
          { label: t("Attendance: lowest"), value: "attendance-asc" },
          { label: t("Payslip: highest"), value: "payslip-desc" },
          { label: t("Payslip: lowest"), value: "payslip-asc" },
        ]}
        value={sort}
      />
      <PeriodNavigator
        start={report.period_start}
        end={report.period_end}
        loading={loading}
        onChange={(offset) => void changeMonth(offset)}
      />
    </div>
  );

  return (
    <>
      <StatisticsSection
        index="01"
        title="Payslip Statistics"
        items={[
          {
            label: t("Payment Contract"),
            note: t("Shared equally by eligible players"),
            value: formatRupiah(report.payment_contract),
          },
          {
            label: t("Eligible Players"),
            note: t("Minimum {count} attendance days", { count: report.attendance_minimum }),
            value: `${report.eligible_players} / ${report.total_players}`,
          },
          {
            label: t("Total Payout"),
            note: t("Total after Rp. 1,000 round-down per player"),
            value: formatRupiah(report.total_payout),
          },
        ]}
      />
      {error ? (
        <ResourceState state="stale" message={t("Could not load selected month.")} onRetry={() => void retry()} />
      ) : null}
      <div className={`mt-4 transition-opacity ${loading ? "opacity-45" : "opacity-100"}`} aria-busy={loading}>
        <DataTable
          action={
            <ReportExportButton
              filename={`payslips-${report.period_start}-${report.period_end}`}
              sheets={buildPayslipSheets(report)}
            />
          }
          code="PR"
          columns={[
            { label: "#" },
            { label: "Character Name" },
            { label: "Discord" },
            { label: "Attendance" },
            { label: "Eligibility" },
            { label: "Payslip" },
          ]}
          empty={t("No matching players found.")}
          summary={t("{count} found", { count: players.length })}
          title={t("Payslip Calculation")}
          toolbar={toolbar}
        >
          {players.map((player, index) => (
            <tr className={dataTableRowClassName} key={player.member_id}>
              <DataTableCell className="text-[var(--color-primary-muted)]">
                {String(index + 1).padStart(2, "0")}
              </DataTableCell>
              <DataTableCell className="font-bold text-[var(--color-foreground)]">
                {player.character_name || "-"}
              </DataTableCell>
              <DataTableCell>
                <span className="block text-[var(--color-foreground)]">{player.display_name}</span>
                <span className="text-[var(--color-foreground-muted)]">@{player.username}</span>
              </DataTableCell>
              <DataTableCell>
                {t("{attended} / {maximum} days", {
                  attended: player.attended_days,
                  maximum: report.attendance_maximum,
                })}
              </DataTableCell>
              <DataTableCell>
                <span className={player.eligible ? "text-[var(--color-success)]" : "text-[var(--color-danger-soft)]"}>
                  {player.eligible ? t("ELIGIBLE") : t("MIN. {count} DAYS", { count: report.attendance_minimum })}
                </span>
              </DataTableCell>
              <DataTableCell className="font-bold text-[var(--color-primary-bright)]">
                {formatRupiah(player.payout)}
              </DataTableCell>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  );
}

function formatRupiah(value: string) {
  return `Rp. ${new Intl.NumberFormat("id-ID").format(BigInt(value))}`;
}
