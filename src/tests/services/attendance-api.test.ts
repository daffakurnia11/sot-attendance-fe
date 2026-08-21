import { describe, expect, it } from "vitest";

import type { AttendanceDay, AttendanceReport } from "@/services/attendance";
import {
  fetchAttendance,
  getAttendanceCalendar,
  getAttendanceCalendarSummary,
  getAttendanceDayDetail,
  getAttendanceMemberDetail,
  getAttendanceSummary,
  getLatestAttendanceSummary,
  getMemberTotalPlaytime,
  getMondayIndex,
  groupAttendanceWeeks,
  sortAttendanceMembers,
} from "@/services/attendance";

const valid = {
  month: "2026-08",
  days_in_month: 31,
  period_start: "2026-08-28",
  period_end: "2026-09-27",
  period_dates: Array.from({ length: 31 }, (_, index) =>
    new Date(Date.UTC(2026, 7, 28 + index)).toISOString().slice(0, 10),
  ),
  attendance_days: ["2026-09-14"],
  total_attended: 1,
  total_opportunities: 2,
  members: [
    {
      member_id: 1,
      username: "delta",
      display_name: "Delta",
      character_name: "Kenji",
      total_attended: 1,
      records: [{ date: "2026-09-14", is_attended: true, playtime_seconds: 5400 }],
    },
    { member_id: 2, username: "prince", display_name: "Prince", character_name: "", total_attended: 0, records: [] },
  ],
};

describe("fetchAttendance", () => {
  it("validates monthly report and forwards month", async () => {
    let requestedURL = "";
    const fetcher = async (input: string | URL | Request) => {
      requestedURL = String(input);
      return new Response(JSON.stringify(valid), { status: 200 });
    };
    await expect(fetchAttendance("http://api.test", "token", "2026-08", fetcher as typeof fetch)).resolves.toEqual(
      valid,
    );
    expect(requestedURL).toBe("http://api.test/api/v1/attendance?month=2026-08");
  });

  it("rejects malformed report", async () => {
    const fetcher = async () => new Response(JSON.stringify({ ...valid, month: "August" }), { status: 200 });
    await expect(fetchAttendance("http://api.test", "token", undefined, fetcher as typeof fetch)).rejects.toThrow(
      "invalid data",
    );
  });
});

describe("sortAttendanceMembers", () => {
  it("sorts by total without mutating API order", () => {
    const members = valid.members;
    expect(sortAttendanceMembers(members, "total-asc", 1).map((member) => member.member_id)).toEqual([2, 1]);
    expect(members.map((member) => member.member_id)).toEqual([1, 2]);
  });

  it("uses member id as stable tie-breaker for percentage", () => {
    const members = valid.members.map((member) => ({ ...member, total_attended: 1 })).reverse();
    expect(sortAttendanceMembers(members, "percentage-desc", 2).map((member) => member.member_id)).toEqual([1, 2]);
  });

  it("sorts by summed monthly playtime", () => {
    expect(sortAttendanceMembers(valid.members, "playtime-desc", 1).map((member) => member.member_id)).toEqual([1, 2]);
    expect(getMemberTotalPlaytime(valid.members[0])).toBe(5400);
  });
});

describe("getLatestAttendanceSummary", () => {
  it("counts eligible players against latest session participants", () => {
    const report = {
      ...valid,
      attendance_days: ["2026-09-13", "2026-09-14"],
      members: [
        valid.members[0],
        { ...valid.members[1], records: [{ date: "2026-09-14", is_attended: false, playtime_seconds: 1200 }] },
        { ...valid.members[1], member_id: 3, records: [] },
      ],
    };
    expect(getLatestAttendanceSummary(report)).toEqual({ date: "2026-09-14", eligible: 1, total: 2, rate: 50 });
  });

  it("returns zero summary when no attendance session exists", () => {
    expect(getLatestAttendanceSummary({ ...valid, attendance_days: [] })).toEqual({
      date: null,
      eligible: 0,
      total: 0,
      rate: 0,
    });
  });
});

describe("getAttendanceSummary", () => {
  it("counts monthly eligibility against attendance records, not all members", () => {
    const report = {
      ...valid,
      members: [
        valid.members[0],
        { ...valid.members[1], records: [{ date: "2026-09-14", is_attended: false, playtime_seconds: 1200 }] },
        { ...valid.members[1], member_id: 3, records: [] },
      ],
    };
    expect(getAttendanceSummary(report)).toEqual({ eligible: 1, total: 2, rate: 50 });
  });
});

describe("getAttendanceCalendar", () => {
  const report = {
    ...valid,
    period_dates: ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04"],
    members: [
      {
        member_id: 1,
        username: "a",
        display_name: "A",
        character_name: "A",
        total_attended: 2,
        records: [
          { date: "2026-08-01", is_attended: true, playtime_seconds: 3600 },
          { date: "2026-08-02", is_attended: true, playtime_seconds: 3600 },
        ],
      },
      {
        member_id: 2,
        username: "b",
        display_name: "B",
        character_name: "B",
        total_attended: 1,
        records: [
          { date: "2026-08-01", is_attended: true, playtime_seconds: 3600 },
          { date: "2026-08-02", is_attended: false, playtime_seconds: 0 },
        ],
      },
      { member_id: 3, username: "c", display_name: "C", character_name: "C", total_attended: 0, records: [] },
    ],
  } as unknown as AttendanceReport;

  it("classifies each day against the player threshold", () => {
    // Threshold 1: clearing it is safe, sitting exactly on it is good, falling
    // short is danger.
    const days = getAttendanceCalendar(report, 1, "2026-08-04");
    expect(days.map((day) => [day.date, day.present, day.status])).toEqual([
      ["2026-08-01", 2, "safe"],
      ["2026-08-02", 1, "good"],
      ["2026-08-03", 0, "danger"],
      ["2026-08-04", 0, "danger"],
    ]);
  });

  it("reports the whole roster as the denominator, not just those who attended", () => {
    expect(getAttendanceCalendar(report, 1, "2026-08-04").every((day) => day.roster === 3)).toBe(true);
  });

  it("marks days after today as upcoming rather than danger", () => {
    // A day nobody could have attended yet must not read as a shortfall.
    const days = getAttendanceCalendar(report, 1, "2026-08-02");
    expect(days.map((day) => day.status)).toEqual(["safe", "good", "upcoming", "upcoming"]);
  });

  it("counts each status for the summary", () => {
    const days = getAttendanceCalendar(report, 1, "2026-08-02");
    expect(getAttendanceCalendarSummary(days)).toEqual({ good: 1, safe: 1, danger: 0, upcoming: 2 });
  });
});

describe("groupAttendanceWeeks", () => {
  const dayAt = (date: string): AttendanceDay => ({ date, present: 0, roster: 1, status: "danger" });

  it("indexes weekdays Monday-first", () => {
    // 2026-08-03 is a Monday, 2026-08-09 the Sunday that closes that week.
    expect(getMondayIndex("2026-08-03")).toBe(0);
    expect(getMondayIndex("2026-08-09")).toBe(6);
  });

  it("pads the first week so each day sits under its own weekday", () => {
    // The real period opens on Tuesday 2026-07-28, so Monday is empty.
    const weeks = groupAttendanceWeeks(["2026-07-28", "2026-07-29", "2026-07-30"].map(dayAt));
    expect(weeks).toHaveLength(1);
    expect(weeks[0][0]).toBeNull();
    expect(weeks[0].slice(1, 4).map((day) => day?.date)).toEqual(["2026-07-28", "2026-07-29", "2026-07-30"]);
    expect(weeks[0].slice(4)).toEqual([null, null, null]);
  });

  it("starts a new row on Monday and pads every row to seven slots", () => {
    const dates = ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04"];
    const weeks = groupAttendanceWeeks(dates.map(dayAt));
    expect(weeks).toHaveLength(2);
    // Saturday and Sunday close the first row; Monday opens the second.
    expect(weeks[0].map((day) => day?.date ?? null)).toEqual([
      null,
      null,
      null,
      null,
      null,
      "2026-08-01",
      "2026-08-02",
    ]);
    expect(weeks[1].map((day) => day?.date ?? null)).toEqual([
      "2026-08-03",
      "2026-08-04",
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });

  it("keeps alignment when a date is missing rather than shifting the rest", () => {
    // Wednesday absent: Thursday must stay in the Thursday column.
    const weeks = groupAttendanceWeeks(["2026-08-04", "2026-08-06"].map(dayAt));
    expect(weeks[0].map((day) => day?.date ?? null)).toEqual([
      null,
      "2026-08-04",
      null,
      "2026-08-06",
      null,
      null,
      null,
    ]);
  });

  it("returns nothing for an empty period", () => {
    expect(groupAttendanceWeeks([])).toEqual([]);
  });
});

describe("getAttendanceDayDetail", () => {
  const report = {
    ...valid,
    members: [
      {
        member_id: 1,
        username: "short",
        display_name: "Short",
        character_name: "Short Session",
        total_attended: 1,
        records: [{ date: "2026-08-05", is_attended: true, playtime_seconds: 3600 }],
      },
      {
        member_id: 2,
        username: "long",
        display_name: "Long",
        character_name: "Long Session",
        total_attended: 1,
        records: [{ date: "2026-08-05", is_attended: true, playtime_seconds: 10800 }],
      },
      {
        member_id: 3,
        username: "missed",
        display_name: "Missed",
        character_name: "Recorded Miss",
        total_attended: 0,
        records: [{ date: "2026-08-05", is_attended: false, playtime_seconds: 120 }],
      },
      {
        member_id: 4,
        username: "absent",
        display_name: "Fallback Name",
        character_name: "",
        total_attended: 0,
        records: [],
      },
    ],
  } as unknown as AttendanceReport;

  it("splits the roster into attended, recorded misses, and no record", () => {
    const detail = getAttendanceDayDetail(report, "2026-08-05");
    expect(detail.attended.map((member) => member.memberID)).toEqual([2, 1]);
    expect(detail.missed.map((member) => member.memberID)).toEqual([3]);
    expect(detail.unrecorded.map((member) => member.memberID)).toEqual([4]);
    expect(detail.roster).toBe(4);
  });

  it("orders those who attended by longest session", () => {
    // The question on a thin day is who actually showed up and for how long.
    expect(getAttendanceDayDetail(report, "2026-08-05").attended.map((member) => member.playtimeSeconds)).toEqual([
      10800, 3600,
    ]);
  });

  it("falls back to the Discord name when no character name is set", () => {
    expect(getAttendanceDayDetail(report, "2026-08-05").unrecorded[0].name).toBe("Fallback Name");
  });

  it("treats a date nobody has a row for as entirely unrecorded", () => {
    const detail = getAttendanceDayDetail(report, "2026-08-06");
    expect(detail.attended).toEqual([]);
    expect(detail.missed).toEqual([]);
    expect(detail.unrecorded).toHaveLength(4);
  });
});

describe("getAttendanceMemberDetail", () => {
  const report = {
    ...valid,
    attendance_days: ["2026-08-04", "2026-08-05", "2026-08-06"],
    period_dates: ["2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07"],
    members: [
      {
        member_id: 7,
        username: "seven",
        display_name: "Seven",
        character_name: "Char Seven",
        total_attended: 1,
        records: [
          { date: "2026-08-05", is_attended: true, playtime_seconds: 5400 },
          { date: "2026-08-06", is_attended: false, playtime_seconds: 60 },
        ],
      },
      {
        member_id: 8,
        username: "eight",
        display_name: "Discord Eight",
        character_name: "",
        total_attended: 0,
        records: [],
      },
    ],
  } as unknown as AttendanceReport;

  it("buckets the member's attendance days three ways", () => {
    const detail = getAttendanceMemberDetail(report, 7);
    expect(detail?.attended.map((day) => day.date)).toEqual(["2026-08-05"]);
    expect(detail?.missed.map((day) => day.date)).toEqual(["2026-08-06"]);
    expect(detail?.unrecorded.map((day) => day.date)).toEqual(["2026-08-04"]);
  });

  it("counts only days somebody attended, not every date in the period", () => {
    // 2026-08-07 is in the period but no session ran, so it must not appear as
    // a miss for anyone.
    const detail = getAttendanceMemberDetail(report, 7);
    expect(detail?.attendanceDays).toBe(3);
    const dates = [...detail!.attended, ...detail!.missed, ...detail!.unrecorded].map((day) => day.date);
    expect(dates).not.toContain("2026-08-07");
    expect(dates).toHaveLength(3);
  });

  it("totals playtime across the member's records", () => {
    expect(getAttendanceMemberDetail(report, 7)?.totalPlaytimeSeconds).toBe(5460);
  });

  it("falls back to the Discord name and reports every day as unrecorded", () => {
    const detail = getAttendanceMemberDetail(report, 8);
    expect(detail?.name).toBe("Discord Eight");
    expect(detail?.unrecorded).toHaveLength(3);
  });

  it("returns null for a member absent from the report", () => {
    expect(getAttendanceMemberDetail(report, 999)).toBeNull();
  });
});
