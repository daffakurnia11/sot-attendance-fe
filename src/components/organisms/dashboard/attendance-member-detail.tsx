"use client";

import { AttendanceDetailDialog } from "@/components/atoms";
import { useI18n } from "@/i18n";
import type { AttendanceMemberDay, AttendanceReport } from "@/services/attendance";
import { getAttendanceMemberDetail } from "@/services/attendance";

type Props = Readonly<{
  /** The member to detail, or null when the dialog is closed. */
  memberID: number | null;
  onClose: () => void;
  report: AttendanceReport;
}>;

export function AttendanceMemberDetail({ memberID, onClose, report }: Props) {
  const { locale, t } = useI18n();
  if (memberID === null) return null;

  const detail = getAttendanceMemberDetail(report, memberID);
  // A sort or a month change can drop the selected member from the report
  // before this renders, so a missing member closes rather than throws.
  if (!detail) return null;

  const rate = detail.attendanceDays === 0 ? 0 : Math.round((detail.attended.length / detail.attendanceDays) * 100);
  const groups = [
    { key: "attended", tone: "success" as const, label: t("Attended"), members: detail.attended, showPlaytime: true },
    { key: "missed", tone: "danger" as const, label: t("Not Attended"), members: detail.missed, showPlaytime: true },
    // Playtime is shown for a recorded miss because the row holds a real
    // session that fell short, which is the useful part. Unrecorded has no row
    // at all, so its zero would be an invention.
    {
      key: "unrecorded",
      tone: "muted" as const,
      label: t("Not Recorded"),
      members: detail.unrecorded,
      showPlaytime: false,
    },
  ];

  return (
    <AttendanceDetailDialog
      title={detail.name}
      onClose={onClose}
      summary={
        <>
          {" "}
          @{detail.username} ·{" "}
          {t("{attended} of {days} attendance days", { attended: detail.attended.length, days: detail.attendanceDays })}{" "}
          · {rate}% · {formatDuration(detail.totalPlaytimeSeconds)}
        </>
      }
      groups={groups.map((group) => ({
        key: group.key,
        label: group.label,
        tone: group.tone,
        count: group.members.length,
        children: (
          <DayList
            days={group.members}
            emptyLabel={t("No dates in this group.")}
            locale={locale}
            showPlaytime={group.showPlaytime}
          />
        ),
      }))}
    />
  );
}

function DayList({
  days,
  emptyLabel,
  locale,
  showPlaytime,
}: {
  days: readonly AttendanceMemberDay[];
  emptyLabel: string;
  locale: "en" | "id";
  showPlaytime: boolean;
}) {
  if (days.length === 0)
    return <p className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">{emptyLabel}</p>;

  return (
    <ul className="grid max-h-[52vh] gap-1 overflow-y-auto pr-1">
      {days.map((day) => (
        <li
          className="flex items-baseline justify-between gap-3 border-b border-[rgba(217,169,80,.1)] py-1.5 text-sm last:border-b-0"
          key={day.date}
        >
          <strong className="text-[var(--color-foreground)]">{formatDate(day.date, locale)}</strong>
          {showPlaytime ? (
            <span className="shrink-0 text-xs text-[var(--color-foreground-muted)]">
              {formatDuration(day.playtimeSeconds)}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function formatDate(date: string, locale: "en" | "id") {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
