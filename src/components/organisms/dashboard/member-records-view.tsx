"use client";

import { AttendanceCalendarGrid, Panel, PeriodNavigator, ResourceState, StatisticsSection } from "@/components/atoms";
import { usePeriodReport } from "@/hooks/use-period-report";
import { useI18n } from "@/i18n";
import { getPersonalAttendanceDays, getRequiredAttendanceRate, splitPlaytime } from "@/lib/member-attendance";
import { formatPeriod } from "@/lib/report-period";
import { type AttendanceReport, attendanceReportSchema, groupAttendanceWeeks } from "@/services/attendance";
import type { MemberRecords } from "@/services/member-records";

type Props = Readonly<{
  data: MemberRecords | null;
  initialAttendance: AttendanceReport | null;
  minimumAttendance: number | null;
  maximumAttendance: number | null;
  today: string;
  discordUserID?: string;
}>;

export function MemberRecordsView({
  data,
  initialAttendance,
  minimumAttendance,
  maximumAttendance,
  today,
  discordUserID,
}: Props) {
  const { report, loading, error, changeMonth, retry } = usePeriodReport({
    initialData: initialAttendance,
    endpoint: discordUserID
      ? `/api/attendance/member?discord_user_id=${encodeURIComponent(discordUserID)}`
      : "/api/attendance/me",
    schema: attendanceReportSchema,
  });
  const { locale, t } = useI18n();
  const duration = data ? splitPlaytime(data.total_playtime_seconds) : null;
  const periodNote = initialAttendance
    ? formatPeriod(initialAttendance.period_start, initialAttendance.period_end, locale)
    : t("Current contract period");
  const statistics = [
    {
      label: t("Total playtime"),
      value: duration
        ? [
            duration.months > 0 ? t("{months}mo", duration) : null,
            duration.days > 0 ? t("{days}d", duration) : null,
            duration.hours > 0 ? t("{hours}h", duration) : null,
            duration.minutes > 0 ? t("{minutes}m", duration) : null,
          ]
            .filter(Boolean)
            .join(" ") || t("{minutes}m", { minutes: 0 })
        : "—",
      note: t("Lifetime playtime · 1 month = 30 days"),
    },
    {
      label: t("Total attended"),
      value:
        initialAttendance && minimumAttendance !== null
          ? `${initialAttendance.total_attended} / ${minimumAttendance}`
          : "—",
      note: periodNote,
    },
    {
      label: t("Attendance rate"),
      value:
        initialAttendance && maximumAttendance !== null
          ? `${getRequiredAttendanceRate(initialAttendance.total_attended, maximumAttendance)}%`
          : "—",
      note: periodNote,
    },
  ];
  const days = report ? getPersonalAttendanceDays(report, today) : [];
  return (
    <>
      <StatisticsSection index="01" title={discordUserID ? "Member statistics" : "My Statistics"} items={statistics} />
      {!data || !initialAttendance || minimumAttendance === null || maximumAttendance === null ? (
        <ResourceState state="unavailable" message={t("Personal records could not be loaded.")} />
      ) : null}
      {!report ? (
        <ResourceState
          state={loading ? "loading" : "unavailable"}
          message={t("Attendance data could not be loaded.")}
          onRetry={() => void retry()}
        />
      ) : (
        <Panel
          className="mt-6"
          title={t(discordUserID ? "Attendance Calendar" : "My attendance calendar")}
          summary={t("{count} attendance days", { count: report.total_attended })}
          action={
            <PeriodNavigator
              start={report.period_start}
              end={report.period_end}
              loading={loading}
              onChange={(offset) => void changeMonth(offset)}
            />
          }
        >
          {error ? (
            <ResourceState state="stale" message={t("Could not load selected month.")} onRetry={() => void retry()} />
          ) : null}
          <div
            className={`overflow-x-auto p-4 transition-opacity sm:p-5 ${loading ? "opacity-45" : "opacity-100"}`}
            aria-busy={loading}
          >
            <AttendanceCalendarGrid locale={locale}>
              {groupAttendanceWeeks(days).flatMap((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  if (!day) return <span aria-hidden="true" key={`empty-${weekIndex}-${dayIndex}`} />;
                  const positive = day.result === "Attended";
                  const missed = day.result === "Not attended";
                  const color = positive
                    ? "text-[var(--color-success)]"
                    : missed
                      ? "text-[var(--color-danger-soft)]"
                      : "text-[var(--color-foreground-muted)]";
                  const card = positive
                    ? "border-[rgba(85,223,189,.28)] bg-[rgba(42,211,169,.06)]"
                    : missed
                      ? "border-[rgba(239,116,116,.3)] bg-[rgba(239,116,116,.06)]"
                      : "border-[var(--color-border)] bg-[rgba(255,255,255,.012)]";
                  return (
                    <div className={`border p-3.5 ${card}`} key={day.date}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs tracking-[.14em] text-[var(--color-foreground-muted)] uppercase">
                          {new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en", {
                            month: "short",
                            timeZone: "UTC",
                          }).format(new Date(`${day.date}T00:00:00Z`))}
                        </span>
                        <i
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${positive ? "bg-[var(--color-success)]" : missed ? "bg-[var(--color-danger-soft)]" : "bg-[rgba(185,172,145,.35)]"}`}
                          aria-hidden="true"
                        />
                      </div>
                      <strong className="mt-1 block font-display text-3xl leading-none font-normal">
                        {Number(day.date.slice(-2))}
                      </strong>
                      <p className={`mt-2.5 text-sm font-bold ${color}`}>
                        {Math.floor(day.playtimeSeconds / 3600)}h {Math.floor((day.playtimeSeconds % 3600) / 60)}m
                      </p>
                      <p className={`mt-1 text-xs font-extrabold tracking-[.12em] uppercase ${color}`}>
                        {t(day.result)}
                      </p>
                    </div>
                  );
                }),
              )}
            </AttendanceCalendarGrid>
          </div>
        </Panel>
      )}
    </>
  );
}
