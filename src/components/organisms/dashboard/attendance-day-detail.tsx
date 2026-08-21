"use client";

import { Modal, Tabs } from "antd";

import { useI18n } from "@/i18n";
import type { AttendanceDayMember, AttendanceReport } from "@/services/attendance";
import { getAttendanceDayDetail } from "@/services/attendance";

type Props = Readonly<{
  /** The date to detail, or null when the dialog is closed. */
  date: string | null;
  onClose: () => void;
  report: AttendanceReport;
}>;

export function AttendanceDayDetail({ date, onClose, report }: Props) {
  const { locale, t } = useI18n();
  // Rendering is skipped rather than the dialog being hidden, so the member
  // lists are not recomputed for every date while it is closed, and each open
  // starts on the first tab.
  if (!date) return null;

  const detail = getAttendanceDayDetail(report, date);
  const groups = [
    { key: "attended", accent: "#55dfbd", label: t("Attended"), members: detail.attended, showPlaytime: true },
    { key: "missed", accent: "#ef7474", label: t("Not Attending"), members: detail.missed, showPlaytime: true },
    // Playtime is shown for a recorded miss because the row holds a real
    // session that fell short, which is the useful part. Unrecorded has no row
    // at all, so its zero would be an invention.
    {
      key: "unrecorded",
      accent: "var(--color-foreground-muted)",
      label: t("Not Recorded"),
      members: detail.unrecorded,
      showPlaytime: false,
    },
  ];

  return (
    <Modal centered footer={null} onCancel={onClose} open title={formatFullDate(date, locale)} width={640}>
      <p className="text-sm text-[var(--color-foreground-muted)]">
        {t("{attended} of {roster} members attended", { attended: detail.attended.length, roster: detail.roster })}
      </p>
      <Tabs
        defaultActiveKey="attended"
        items={groups.map((group) => ({
          key: group.key,
          label: (
            <span className="flex items-center gap-2 text-xs font-extrabold tracking-[.1em] uppercase">
              <i
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: group.accent }}
                aria-hidden="true"
              />
              {group.label}
              <span className="text-[var(--color-foreground-muted)]">{group.members.length}</span>
            </span>
          ),
          children: (
            <MemberList
              emptyLabel={t("No members in this group.")}
              members={group.members}
              showPlaytime={group.showPlaytime}
            />
          ),
        }))}
      />
    </Modal>
  );
}

function MemberList({
  emptyLabel,
  members,
  showPlaytime,
}: {
  emptyLabel: string;
  members: readonly AttendanceDayMember[];
  showPlaytime: boolean;
}) {
  if (members.length === 0)
    return <p className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">{emptyLabel}</p>;

  return (
    // Capped so a 40-name group scrolls inside the dialog instead of pushing it
    // past the viewport.
    <ul className="grid max-h-[52vh] gap-1 overflow-y-auto pr-1">
      {members.map((member) => (
        <li
          className="flex items-baseline justify-between gap-3 border-b border-[rgba(217,169,80,.1)] py-1.5 text-sm last:border-b-0"
          key={member.memberID}
        >
          <span className="min-w-0">
            <strong className="text-[var(--color-foreground)]">{member.name}</strong>
            <span className="ml-2 text-xs text-[var(--color-foreground-muted)]">@{member.username}</span>
          </span>
          {showPlaytime ? (
            <span className="shrink-0 text-xs text-[var(--color-foreground-muted)]">
              {formatDuration(member.playtimeSeconds)}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function formatFullDate(date: string, locale: "en" | "id") {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
