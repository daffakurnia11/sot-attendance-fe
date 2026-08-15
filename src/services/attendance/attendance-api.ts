import { z } from "zod";

const dailyRecordSchema = z.object({
  date: z.iso.date(),
  is_attended: z.boolean(),
  playtime_seconds: z.number().int().nonnegative(),
});

const memberRecordSchema = z.object({
  member_id: z.number().int().positive(),
  username: z.string(),
  display_name: z.string(),
  character_name: z.string(),
  total_attended: z.number().int().nonnegative(),
  records: z.array(dailyRecordSchema),
});

export const attendanceReportSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  days_in_month: z.number().int().min(28).max(31),
  period_start: z.iso.date(),
  period_end: z.iso.date(),
  period_dates: z.array(z.iso.date()).min(28).max(31),
  attendance_days: z.array(z.iso.date()),
  total_attended: z.number().int().nonnegative(),
  total_opportunities: z.number().int().nonnegative(),
  members: z.array(memberRecordSchema),
});

export type AttendanceReport = z.infer<typeof attendanceReportSchema>;
export type AttendanceSort = "default" | "total-desc" | "total-asc" | "percentage-desc" | "percentage-asc" | "playtime-desc" | "playtime-asc";

export function getAttendanceSummary(report: AttendanceReport) {
  const records = report.members.flatMap((member) => member.records);
  const eligible = records.filter((record) => record.is_attended).length;
  const total = records.length;

  return { eligible, total, rate: total === 0 ? 0 : (eligible / total) * 100 };
}

export function getLatestAttendanceSummary(report: AttendanceReport) {
  const latestDate = report.attendance_days.at(-1);
  if (!latestDate) return { date: null, eligible: 0, total: 0, rate: 0 };

  const latestRecords = report.members.flatMap((member) => member.records.filter((record) => record.date === latestDate));
  const eligible = latestRecords.filter((record) => record.is_attended).length;
  const total = latestRecords.length;

  return { date: latestDate, eligible, total, rate: total === 0 ? 0 : (eligible / total) * 100 };
}

export function sortAttendanceMembers(members: AttendanceReport["members"], sort: AttendanceSort, attendanceDays: number) {
  if (sort === "default") return members;

  const direction = sort.endsWith("-desc") ? -1 : 1;
  const value = (member: AttendanceReport["members"][number]) => {
    if (sort.startsWith("playtime")) return getMemberTotalPlaytime(member);
    if (sort.startsWith("percentage")) return attendanceDays === 0 ? 0 : (member.total_attended / attendanceDays) * 100;
    return member.total_attended;
  };

  return [...members].sort((left, right) => {
    const difference = value(left) - value(right);
    return difference === 0 ? left.member_id - right.member_id : difference * direction;
  });
}

export function getMemberTotalPlaytime(member: AttendanceReport["members"][number]) {
  return member.records.reduce((total, record) => total + record.playtime_seconds, 0);
}

export async function fetchAttendance(baseURL: string, accessToken: string, month?: string, fetcher: typeof fetch = fetch, personal = false) {
  const url = new URL(personal ? "/api/v1/attendance/me" : "/api/v1/attendance", baseURL);
  if (month) url.searchParams.set("month", month);
  const response = await fetcher(url, {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Attendance API returned ${response.status}`);
  const parsed = attendanceReportSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Attendance API returned invalid data");
  return parsed.data;
}
