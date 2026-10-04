import { describe, expect, it } from "vitest";

import {
  getPersonalAttendanceDays,
  getRequiredAttendanceRate,
  selectMemberAttendance,
  splitPlaytime,
} from "@/lib/member-attendance";
import type { AttendanceReport } from "@/services/attendance";

describe("personal attendance", () => {
  it("splits lifetime duration into fixed months, days, hours and minutes", () => {
    expect(splitPlaytime(384 * 3600 + 14 * 60)).toEqual({ months: 0, days: 16, hours: 0, minutes: 14 });
    expect(splitPlaytime(31 * 86400 + 2 * 3600 + 3 * 60 + 59)).toEqual({ months: 1, days: 1, hours: 2, minutes: 3 });
    expect(splitPlaytime(0)).toEqual({ months: 0, days: 0, hours: 0, minutes: 0 });
  });
  it("uses configured required days without capping progress", () => {
    expect(getRequiredAttendanceRate(3, 26)).toBe(12);
    expect(getRequiredAttendanceRate(25, 20)).toBe(125);
    expect(getRequiredAttendanceRate(0, 0)).toBe(0);
  });
  it("keeps recorded misses, missing rows and future dates distinct across month boundary", () => {
    const report = {
      period_dates: ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01"],
      members: [
        {
          records: [
            { date: "2026-09-28", is_attended: true, playtime_seconds: 9000 },
            { date: "2026-09-29", is_attended: false, playtime_seconds: 600 },
          ],
        },
      ],
    } as AttendanceReport;
    expect(getPersonalAttendanceDays(report, "2026-09-30").map((day) => day.result)).toEqual([
      "Attended",
      "Not attended",
      "Unrecorded",
      "Upcoming",
    ]);
    expect(getPersonalAttendanceDays({ ...report, members: [] }, "2026-09-30")[0].result).toBe("Unrecorded");
  });
});

describe("member attendance selection", () => {
  it("isolates the chosen Discord member and recalculates totals", () => {
    const first = {
      member_id: 1,
      username: "first",
      display_name: "First",
      character_name: "First",
      discord_user_id: "282921788659335169",
      total_attended: 4,
      records: [],
    };
    const second = {
      member_id: 2,
      username: "second",
      display_name: "Second",
      character_name: "Second",
      discord_user_id: "406954574998536202",
      total_attended: 3,
      records: [],
    };
    const roster: AttendanceReport = {
      month: "2026-09",
      days_in_month: 30,
      period_start: "2026-09-28",
      period_end: "2026-10-27",
      period_dates: [],
      members: [first, second],
      attendance_days: ["2026-09-28", "2026-09-29"],
      total_attended: 7,
      total_opportunities: 4,
    };
    expect(selectMemberAttendance(roster, second.discord_user_id)).toMatchObject({
      members: [second],
      total_attended: 3,
      total_opportunities: 2,
    });
    expect(selectMemberAttendance(roster, "999")).toMatchObject({
      members: [],
      total_attended: 0,
      total_opportunities: 0,
    });
    expect(roster.members).toHaveLength(2);
  });
});
