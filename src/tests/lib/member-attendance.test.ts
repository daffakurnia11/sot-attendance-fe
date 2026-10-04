import { describe, expect, it } from "vitest";

import { getPersonalAttendanceDays, getRequiredAttendanceRate, splitPlaytime } from "@/lib/member-attendance";
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
