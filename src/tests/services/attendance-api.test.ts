import { describe, expect, it } from "vitest";

import { fetchAttendance, getAttendanceSummary, getLatestAttendanceSummary, getMemberTotalPlaytime, sortAttendanceMembers } from "@/services/attendance";

const valid = {
  month: "2026-08", days_in_month: 31, attendance_days: ["2026-08-14"],
  total_attended: 1, total_opportunities: 2,
  members: [
    { member_id: 1, username: "delta", display_name: "Delta", character_name: "Kenji", total_attended: 1, records: [{ date: "2026-08-14", is_attended: true, playtime_seconds: 5400 }] },
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
    await expect(fetchAttendance("http://api.test", "token", "2026-08", fetcher as typeof fetch)).resolves.toEqual(valid);
    expect(requestedURL).toBe("http://api.test/api/v1/attendance?month=2026-08");
  });

  it("rejects malformed report", async () => {
    const fetcher = async () => new Response(JSON.stringify({ ...valid, month: "August" }), { status: 200 });
    await expect(fetchAttendance("http://api.test", "token", undefined, fetcher as typeof fetch)).rejects.toThrow("invalid data");
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
      attendance_days: ["2026-08-13", "2026-08-14"],
      members: [
        valid.members[0],
        { ...valid.members[1], records: [{ date: "2026-08-14", is_attended: false, playtime_seconds: 1200 }] },
        { ...valid.members[1], member_id: 3, records: [] },
      ],
    };
    expect(getLatestAttendanceSummary(report)).toEqual({ date: "2026-08-14", eligible: 1, total: 2, rate: 50 });
  });

  it("returns zero summary when no attendance session exists", () => {
    expect(getLatestAttendanceSummary({ ...valid, attendance_days: [] })).toEqual({ date: null, eligible: 0, total: 0, rate: 0 });
  });
});

describe("getAttendanceSummary", () => {
  it("counts monthly eligibility against attendance records, not all members", () => {
    const report = {
      ...valid,
      members: [
        valid.members[0],
        { ...valid.members[1], records: [{ date: "2026-08-14", is_attended: false, playtime_seconds: 1200 }] },
        { ...valid.members[1], member_id: 3, records: [] },
      ],
    };
    expect(getAttendanceSummary(report)).toEqual({ eligible: 1, total: 2, rate: 50 });
  });
});
