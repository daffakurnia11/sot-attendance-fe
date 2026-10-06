"use client";

import { StatisticsSection } from "@/components/atoms";
import { useI18n } from "@/i18n";
import { getRequiredAttendanceRate, splitPlaytime } from "@/lib/member-attendance";
import { formatPeriod } from "@/lib/report-period";
import type { AttendanceReport } from "@/services/attendance";
import type { MemberRecords } from "@/services/member-records";

export type MemberStatisticsProps = {
  data: MemberRecords | null;
  initialAttendance: AttendanceReport | null;
  minimumAttendance: number | null;
  maximumAttendance: number | null;
};

export function MemberStatistics({
  data,
  initialAttendance,
  minimumAttendance,
  maximumAttendance,
  index = "01",
  title = "My Statistics",
}: MemberStatisticsProps & { index?: string; title?: string }) {
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
  return <StatisticsSection index={index} title={title} items={statistics} />;
}
