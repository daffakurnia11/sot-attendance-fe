"use client";

import { useState } from "react";

import {
  MetricCard,
  OptionDropdown,
  Panel,
  PeriodNavigator,
  ReportExportButton,
  ResourceState,
  SearchField,
} from "@/components/atoms";
import { usePeriodReport } from "@/hooks/use-period-report";
import { useI18n } from "@/i18n";
import { buildAttendanceSheet } from "@/lib/report-export";
import type { AttendanceReport, AttendanceSort } from "@/services/attendance";
import { attendanceReportSchema } from "@/services/attendance";
import {
  getAttendanceSummary,
  getLatestAttendanceSummary,
  getMemberTotalPlaytime,
  sortAttendanceMembers,
} from "@/services/attendance";

import { AttendanceDayDetail } from "./attendance-day-detail";
import { AttendanceMemberDetail } from "./attendance-member-detail";
import { AttendanceModeTabs } from "./attendance-mode-tabs";

export function AttendanceView({
  initialData,
  personal = false,
  combined = false,
}: {
  initialData: AttendanceReport | null;
  personal?: boolean;
  combined?: boolean;
}) {
  const { report, loading, error, changeMonth, retry } = usePeriodReport({
    initialData,
    endpoint: personal ? "/api/attendance/me" : "/api/attendance",
    schema: attendanceReportSchema,
  });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AttendanceSort>("default");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const { t } = useI18n();

  if (!report)
    return (
      <ResourceState
        state={loading ? "loading" : "unavailable"}
        message={loading ? t("Loading data...") : t("Attendance data could not be loaded.")}
        onRetry={() => void retry()}
      />
    );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredMembers = normalizedQuery
    ? report.members.filter((member) =>
        [member.display_name, member.username, member.character_name].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
      )
    : report.members;
  const members = sortAttendanceMembers(filteredMembers, sort, report.attendance_days.length);
  const monthly = getAttendanceSummary(report);
  const latest = getLatestAttendanceSummary(report);
  const dates = report.period_dates;

  return (
    <>
      {combined ? <AttendanceModeTabs active="recap" /> : null}
      <section className={`mt-[var(--space-section)] grid gap-3 sm:grid-cols-2 ${personal ? "" : "xl:grid-cols-4"}`}>
        <AttendanceMetric label={t("Total attendance")} numerator={monthly.eligible} denominator={monthly.total} />
        <AttendanceMetric label={t("Attendance rate")} rate={monthly.rate} />
        {!personal ? (
          <AttendanceMetric
            label={t("Latest total attendance")}
            numerator={latest.eligible}
            denominator={latest.total}
          />
        ) : null}
        {!personal ? <AttendanceMetric label={t("Latest attendance rate")} rate={latest.rate} /> : null}
      </section>

      <Panel
        className="mt-4"
        title={t("Attendance summary by date")}
        summary={t("{count} attendance days", { count: report.attendance_days.length })}
        action={
          <ReportExportButton
            filename={`attendance-${report.period_start}-${report.period_end}`}
            sheets={[buildAttendanceSheet(report)]}
          />
        }
      >
        {error ? (
          <ResourceState state="stale" message={t("Could not load selected month.")} onRetry={() => void retry()} />
        ) : null}
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          {!personal ? (
            <>
              <SearchField
                label={t("Search members")}
                density="comfortable"
                id="attendance-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Search members...")}
                type="search"
                value={query}
              />
              <OptionDropdown
                ariaLabel={t("Sort attendance")}
                className="min-w-[176px]"
                onChange={(value) => setSort(value as AttendanceSort)}
                options={[
                  { label: t("Default order"), value: "default" },
                  { label: t("Total: highest"), value: "total-desc" },
                  { label: t("Total: lowest"), value: "total-asc" },
                  { label: t("%: highest"), value: "percentage-desc" },
                  { label: t("%: lowest"), value: "percentage-asc" },
                  { label: t("Playtime: highest"), value: "playtime-desc" },
                  { label: t("Playtime: lowest"), value: "playtime-asc" },
                ]}
                value={sort}
              />
            </>
          ) : null}
          <PeriodNavigator
            start={report.period_start}
            end={report.period_end}
            loading={loading}
            onChange={(offset) => void changeMonth(offset)}
          />
        </div>

        <div
          className={`overflow-x-auto transition-opacity ${loading ? "opacity-45" : "opacity-100"}`}
          aria-busy={loading}
        >
          <div className="min-w-max">
            <div
              className="relative isolate grid grid-cols-[240px_repeat(var(--days),38px)_100px_70px_64px] border-b border-[var(--color-border)] text-xs font-black tracking-[.1em] text-[var(--color-primary-muted)] uppercase"
              style={{ "--days": report.days_in_month } as React.CSSProperties}
            >
              <span className="relative bg-[var(--color-background-soft)] px-3 py-2.5 md:sticky md:left-0 md:z-30 md:border-r md:border-[var(--color-border)] md:shadow-[8px_0_12px_rgba(0,0,0,.25)]">
                {t("Character Name")}
              </span>
              {dates.map((date) => (
                <button
                  aria-label={t("Show attendance detail")}
                  className="relative z-0 grid cursor-pointer place-items-center text-[var(--color-primary-muted)] transition-colors hover:text-[var(--color-primary-bright)]"
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  type="button"
                >
                  {Number(date.slice(-2))}
                </button>
              ))}
              <span className="grid place-items-center bg-[var(--color-background-soft)] md:sticky md:right-[134px] md:z-20 md:shadow-[-8px_0_12px_rgba(0,0,0,.2)]">
                {t("Playtime")}
              </span>
              <span className="grid place-items-center bg-[var(--color-background-soft)] md:sticky md:right-16 md:z-20">
                {t("Total")}
              </span>
              <span className="grid place-items-center bg-[var(--color-background-soft)] md:sticky md:right-0 md:z-20">
                %
              </span>
            </div>
            {members.map((member) => {
              const records = new Map(member.records.map((record) => [record.date, record]));
              const memberRate =
                report.attendance_days.length === 0
                  ? 0
                  : Math.round((member.total_attended / report.attendance_days.length) * 100);
              return (
                <div
                  className="relative isolate grid min-h-[52px] grid-cols-[240px_repeat(var(--days),38px)_100px_70px_64px] border-b border-[rgba(217,169,80,.1)] text-sm last:border-b-0"
                  style={{ "--days": report.days_in_month } as React.CSSProperties}
                  key={member.member_id}
                >
                  <button
                    aria-label={t("Show member detail")}
                    className="relative flex cursor-pointer items-center gap-2.5 bg-[var(--color-background-soft)] px-3 py-2 text-left transition-colors hover:bg-[#1d160b] md:sticky md:left-0 md:z-30 md:border-r md:border-[var(--color-border)] md:shadow-[8px_0_12px_rgba(0,0,0,.25)]"
                    onClick={() => setSelectedMember(member.member_id)}
                    type="button"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgba(242,182,61,.16)] text-xs font-black text-[var(--color-primary-bright)]">
                      {initials(member.character_name || member.username)}
                    </span>
                    <span className="min-w-0">
                      <strong className="block overflow-hidden text-ellipsis whitespace-nowrap">
                        {member.character_name || "-"}
                      </strong>
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[var(--color-foreground-muted)]">
                        @{member.username}
                      </span>
                    </span>
                  </button>
                  {dates.map((date) => {
                    const record = records.get(date);
                    // Keyed on whether an attendance_logs row exists for this
                    // member and date, not on whether anyone attended that day. A
                    // red cross is a recorded miss; a dash means no row, so there
                    // is nothing to report either way.
                    return (
                      <span
                        className="relative z-0 grid place-items-center"
                        title={record ? `${formatDuration(record.playtime_seconds)} playtime` : undefined}
                        key={date}
                      >
                        {record ? (
                          record.is_attended ? (
                            <i
                              className="grid h-6 w-6 place-items-center rounded-md bg-[rgba(42,211,169,.16)] not-italic text-[var(--color-success)]"
                              aria-label={t("Attended")}
                            >
                              ✓
                            </i>
                          ) : (
                            <i
                              className="grid h-6 w-6 place-items-center rounded-md bg-[rgba(239,116,116,.16)] not-italic text-[var(--color-danger-soft)]"
                              aria-label={t("Not attended")}
                            >
                              ✗
                            </i>
                          )
                        ) : (
                          <i className="not-italic text-[var(--color-foreground-muted)]" aria-label={t("No record")}>
                            —
                          </i>
                        )}
                      </span>
                    );
                  })}
                  <strong className="grid place-items-center bg-[var(--color-background-soft)] text-[var(--color-foreground)] md:sticky md:right-[134px] md:z-10 md:shadow-[-8px_0_12px_rgba(0,0,0,.2)]">
                    {formatDuration(getMemberTotalPlaytime(member))}
                  </strong>
                  <strong className="grid place-items-center bg-[var(--color-background-soft)] text-[var(--color-primary-bright)] md:sticky md:right-16 md:z-10">
                    {member.total_attended}
                  </strong>
                  <strong className="grid place-items-center bg-[var(--color-background-soft)] text-[var(--color-foreground-muted)] md:sticky md:right-0 md:z-10">
                    {memberRate}%
                  </strong>
                </div>
              );
            })}
            {!members.length ? (
              <div className="grid min-h-[120px] place-items-center text-sm text-[var(--color-foreground-muted)]">
                {t("No matching members found.")}
              </div>
            ) : null}
          </div>
        </div>
      </Panel>

      <AttendanceDayDetail date={selectedDate} onClose={() => setSelectedDate(null)} report={report} />
      <AttendanceMemberDetail memberID={selectedMember} onClose={() => setSelectedMember(null)} report={report} />
    </>
  );
}

function AttendanceMetric({
  denominator,
  label,
  numerator,
  rate,
}: {
  denominator?: number;
  label: string;
  numerator?: number;
  rate?: number;
}) {
  return (
    <MetricCard
      label={label}
      tone={rate === undefined ? "neutral" : "success"}
      value={
        rate === undefined ? (
          <>
            {numerator} <span className="text-lg text-[var(--color-foreground-muted)]">/ {denominator}</span>
          </>
        ) : (
          `${rate.toFixed(1)}%`
        )
      }
    />
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
