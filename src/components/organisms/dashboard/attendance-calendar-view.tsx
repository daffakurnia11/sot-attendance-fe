"use client";

import { Alert } from "antd";
import { useRef, useState } from "react";

import { DashboardPage } from "@/components/templates";
import { useI18n } from "@/i18n";
import type { AttendanceDayStatus, AttendanceReport } from "@/services/attendance";
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
    dot: "bg-[#55dfbd]",
    count: "text-[#55dfbd]",
    label: "text-[#55dfbd]",
  },
  danger: {
    card: "border-[rgba(239,116,116,.3)] bg-[rgba(239,116,116,.06)]",
    dot: "bg-[#ef7474]",
    count: "text-[#ef7474]",
    label: "text-[#ef7474]",
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
  const [report, setReport] = useState(initialData);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(!initialData);
  const requestController = useRef<AbortController | null>(null);
  const { locale, t, translate } = useI18n();

  async function changeMonth(offset: number) {
    if (!report) return;
    const target = shiftMonth(report.month, offset);
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/attendance?month=${encodeURIComponent(target)}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("request failed");
      setReport((await response.json()) as AttendanceReport);
    } catch (requestError) {
      if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError(true);
    } finally {
      if (requestController.current === controller) setLoading(false);
    }
  }

  if (!report)
    return (
      <div className="w-full px-3.5 pt-6 sm:px-6 sm:pt-[30px]">
        <Alert type="error" showIcon title={t("Attendance data could not be loaded.")} />
      </div>
    );

  const days = getAttendanceCalendar(report, playerThreshold, today);
  const summary = getAttendanceCalendarSummary(days);
  const weeks = groupAttendanceWeeks(days);

  return (
    <DashboardPage
      description={
        combined
          ? "Monthly member totals and daily turnout across the contract period."
          : "Daily turnout across the contract period, measured against the player threshold."
      }
      eyebrow="Member records"
      title={combined ? "Attendance" : "Attendance Calendar"}
    >
      {combined ? <AttendanceModeTabs active="calendar" /> : null}
      <section className="mt-[30px] grid gap-3 sm:grid-cols-3">
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

      <section className="mt-4 border border-[var(--color-border)] bg-[rgba(255,255,255,.012)]">
        <div className="flex flex-col items-start gap-2 border-b border-[var(--color-border)] px-4 py-3 text-sm sm:flex-row sm:items-center sm:gap-3">
          <span className="flex items-center gap-3">
            <i className="h-2 w-2 shrink-0 rounded-full bg-[#55dfbd] shadow-[0_0_10px_rgba(85,223,189,.5)]" />
            <strong className="whitespace-nowrap uppercase">{t("Attendance summary by date")}</strong>
          </span>
          <span className="whitespace-nowrap rounded-full bg-[rgba(255,255,255,.04)] px-2 py-1 text-xs text-[var(--color-foreground-muted)]">
            {t("{count} attendance days", { count: report.attendance_days.length })}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              aria-label={t("Previous month")}
              className="grid h-9 w-9 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:opacity-40"
              disabled={loading}
              onClick={() => void changeMonth(-1)}
              type="button"
            >
              ‹
            </button>
            <strong className="min-w-[170px] text-center text-sm tracking-[.06em] uppercase">
              {formatPeriod(report.period_start, report.period_end, locale)}
            </strong>
            <button
              aria-label={t("Next month")}
              className="grid h-9 w-9 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:opacity-40"
              disabled={loading}
              onClick={() => void changeMonth(1)}
              type="button"
            >
              ›
            </button>
          </div>
        </div>
        {error ? <Alert className="m-3" type="error" showIcon title={t("Could not load selected month.")} /> : null}
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
                    <strong className="mt-1 block font-[Impact] text-3xl leading-none font-normal">
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
      </section>

      <AttendanceDayDetail date={selectedDate} onClose={() => setSelectedDate(null)} report={report} />
    </DashboardPage>
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
  const style = statusStyles[status];
  return (
    <article className={`border px-5 py-4 ${style.card}`}>
      <p className="flex items-center gap-2.5 text-xs font-black tracking-[.18em] uppercase">
        <i className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
        <span className={style.label}>{label}</span>
      </p>
      <strong className={`mt-2 block font-[Impact] text-3xl font-normal ${style.count}`}>{value}</strong>
      <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">{note}</p>
    </article>
  );
}

function shiftMonth(month: string, offset: number) {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
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

function formatPeriod(start: string, end: string, locale: "en" | "id") {
  const formatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(new Date(`${start}T00:00:00Z`))} – ${formatter.format(new Date(`${end}T00:00:00Z`))}`;
}
