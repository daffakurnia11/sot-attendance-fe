import type { AttendanceReport } from "@/services/attendance";

/** Duration months are fixed at 30 days, rather than calendar months. */
export function splitPlaytime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return {
    months: Math.floor(minutes / 43200),
    days: Math.floor((minutes % 43200) / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
  };
}

export function getPersonalAttendanceDays(report: AttendanceReport, today: string) {
  const records = new Map(report.members[0]?.records.map((record) => [record.date, record]));
  return report.period_dates.map((date) => {
    const record = records.get(date);
    const status: "Upcoming" | "Attended" | "Not attended" | "Unrecorded" =
      date > today ? "Upcoming" : record ? (record.is_attended ? "Attended" : "Not attended") : "Unrecorded";
    return { date, result: status, playtimeSeconds: record?.playtime_seconds ?? 0 };
  });
}

export function getRequiredAttendanceRate(attended: number, required: number) {
  return required > 0 ? Math.round((attended / required) * 100) : 0;
}

export function selectMemberAttendance(report: AttendanceReport, discordUserID: string): AttendanceReport {
  const members = report.members.filter((member) => member.discord_user_id === discordUserID);
  return {
    ...report,
    members,
    total_attended: members[0]?.total_attended ?? 0,
    total_opportunities: members.length * report.attendance_days.length,
  };
}
