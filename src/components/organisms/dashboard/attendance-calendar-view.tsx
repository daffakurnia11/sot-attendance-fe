"use client";

import { useState } from "react";

import { MetricCard,Panel, PeriodNavigator, ResourceState } from "@/components/atoms";
import { usePeriodReport } from "@/hooks/use-period-report";
import { useI18n } from "@/i18n";
import type { AttendanceDayStatus, AttendanceReport } from "@/services/attendance";
import { attendanceReportSchema } from "@/services/attendance";
import { getAttendanceCalendar, getAttendanceCalendarSummary, groupAttendanceWeeks } from "@/services/attendance";

import { AttendanceDayDetail } from "./attendance-day-detail";
import { AttendanceModeTabs } from "./attendance-mode-tabs";

type Props = Readonly<{
  initialData: AttendanceReport | null;
  playerThreshold: number;
  /** Asia/Jakarta date, resolved on the server so both renders agree. */
  today: string;
  combined?: boolean;
}>;

const statusStyles: Record<AttendanceDayStatus, { card: string; dot: string; count: string; label: string }> = {
  good: {
    card: "border-[rgba(242,182,61,.3)] bg-[rgba(242,182,61,.06)]",
    dot: "bg-[var(--color-primary)]",
    count: "text-[var(--color-primary)]",
    label: "text-[var(--color-primary)]",
  },
  safe: {
    card: "border-[rgba(85,223,189,.28)] bg-[rgba(42,211,169,.06)]",
    dot: "bg-[var(--color-success)]",
    count: "text-[var(--color-success)]",
    label: "text-[var(--color-success)]",
  },
  danger: {
    card: "border-[rgba(239,116,116,.3)] bg-[rgba(239,116,116,.06)]",
    dot: "bg-[var(--color-danger-soft)]",
    count: "text-[var(--color-danger-soft)]",
    label: "text-[var(--color-danger-soft)]",
  },
  upcoming: {
    card: "border-[var(--color-border)] bg-[rgba(255,255,255,.012)]",
    dot: "bg-[rgba(185,172,145,.35)]",
    count: "text-[var(--color-foreground-muted)]",
    label: "text-[var(--color-foreground-muted)]",
  },
};

const statusLabels: Record<AttendanceDayStatus, string> = {
  good: "Good",
  safe: "Safe",
  danger: "Danger",
  upcoming: "Upcoming",
};

export function AttendanceCalendarView({ initialData, playerThreshold, today, combined = false }: Props) {
  const { report, loading, error, changeMonth, retry } = usePeriodReport({
    initialData,
    endpoint: "/api/attendance",
    schema: attendanceReportSchema,
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { locale, t, translate } = useI18n();

  if (!report)
    return (
      <ResourceState
        state={loading ? "loading" : "unavailable"}
        message={loading ? t("Loading data...") : t("Attendance data could not be loaded.")}
        onRetry={() => void retry()}
      />
    );

  const days = getAttendanceCalendar(report, playerThreshold, today);
  const summary = getAttendanceCalendarSummary(days);
  const weeks = groupAttendanceWeeks(days);

  return (
    <>
      {combined ? <AttendanceModeTabs active="calendar" /> : null}
      <section className="mt-[var(--space-section)] grid gap-3 sm:grid-cols-3">
        <LegendCard
          label={t("Safe")}
          note={t("Above {count} players", { count: playerThreshold })}
          status="safe"
          value={summary.safe}
        />
        <LegendCard
          label={t("Good")}
          note={t("Exactly {count} players", { count: playerThreshold })}
          status="good"
          value={summary.good}
        />
        <LegendCard
          label={t("Danger")}
          note={t("Below {count} players", { count: playerThreshold })}
          status="danger"
          value={summary.danger}
        />
      </section>

      <Panel
        className="mt-4"
        title={t("Attendance summary by date")}
        summary={t("{count} attendance days", { count: report.attendance_days.length })}
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
          <div className="grid min-w-[760px] grid-cols-7 gap-3">
            {weekdayHeadings(locale).map((weekday) => (
              <span
                className="pb-1 text-center text-xs font-black tracking-[.14em] text-[var(--color-primary-muted)] uppercase"
                key={weekday}
              >
                {weekday}
              </span>
            ))}
            {weeks.flatMap((week, weekIndex) =>
              week.map((day, dayIndex) => {
                // Empty slots keep the remaining days under the right weekday; the
                // first and last weeks of a contract period are usually partial.
                if (!day) return <span aria-hidden="true" key={`empty-${weekIndex}-${dayIndex}`} />;
                const style = statusStyles[day.status];
                return (
                  <button
                    aria-label={t("Show attendance detail")}
                    className={`cursor-pointer border p-3.5 text-left transition-colors hover:border-[var(--color-primary-muted)] ${style.card}`}
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs tracking-[.14em] text-[var(--color-foreground-muted)] uppercase">
                        {formatMonth(day.date, locale)}
                      </span>
                      <i className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                    </div>
                    <strong className="mt-1 block font-display text-3xl leading-none font-normal">
                      {Number(day.date.slice(-2))}
                    </strong>
                    <p className="mt-2.5 text-sm">
                      <span className={`font-bold ${style.count}`}>{day.present}</span>
                      <span className="text-[var(--color-foreground-muted)]"> / {day.roster}</span>
                    </p>
                    <p className={`mt-1 text-xs font-extrabold tracking-[.12em] uppercase ${style.label}`}>
                      {translate(statusLabels[day.status])}
                    </p>
                  </button>
                );
              }),
            )}
          </div>
        </div>
      </Panel>

      <AttendanceDayDetail date={selectedDate} onClose={() => setSelectedDate(null)} report={report} />
    </>
  );
}

function LegendCard({
  label,
  note,
  status,
  value,
}: {
  label: string;
  note: string;
  status: AttendanceDayStatus;
  value: number;
}) {
  return (
    <MetricCard
      label={label}
      value={value}
      note={note}
      dot
      tone={status === "safe" ? "success" : status === "danger" ? "danger" : status === "good" ? "warning" : "muted"}
    />
  );
}

function formatMonth(date: string, locale: "en" | "id") {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en", { month: "short", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

// 2026-08-03 is a Monday, so seven days from it give Monday-first headings in
// whichever locale is active.
function weekdayHeadings(locale: "en" | "id") {
  const formatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en", { weekday: "short", timeZone: "UTC" });
  return Array.from({ length: 7 }, (_unused, offset) => formatter.format(new Date(Date.UTC(2026, 7, 3 + offset))));
}
