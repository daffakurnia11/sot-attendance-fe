import { describe, expect, it } from "vitest";

import { fetchPayslips, sortPayslipPlayers } from "@/services/payslip";

const valid = { month: "2026-08", period_start: "2026-08-28", period_end: "2026-09-27", payment_contract: "8000000", attendance_minimum: 24, attendance_maximum: 30, total_players: 1, eligible_players: 1, total_payout: "8000000", players: [{ member_id: 1, username: "delta", display_name: "Delta", character_name: "Kenji", attended_days: 24, eligible: true, payout: "8000000" }] };

describe("fetchPayslips", () => {
  it("validates the report and forwards month", async () => {
    let requestedURL = "";
    const fetcher = async (input: string | URL | Request) => { requestedURL = String(input); return new Response(JSON.stringify(valid), { status: 200 }); };
    await expect(fetchPayslips("http://api.test", "token", "2026-08", fetcher as typeof fetch)).resolves.toEqual(valid);
    expect(requestedURL).toBe("http://api.test/api/v1/payslips?month=2026-08");
  });
  it("rejects unsafe amount shapes", async () => {
    const fetcher = async () => new Response(JSON.stringify({ ...valid, total_payout: 6400000 }), { status: 200 });
    await expect(fetchPayslips("http://api.test", "token", undefined, fetcher as typeof fetch)).rejects.toThrow("invalid data");
  });
});

const player = (member_id: number, attended_days: number, payout: string, eligible = true) => ({
  member_id, username: `u${member_id}`, display_name: `D${member_id}`, character_name: `C${member_id}`,
  attended_days, eligible, payout,
});

describe("sortPayslipPlayers", () => {
  const players = [
    player(3, 5, "1210000"),
    player(1, 19, "4600000"),
    player(2, 0, "0", false),
  ];

  it("leaves the server order untouched by default", () => {
    expect(sortPayslipPlayers(players, "default")).toBe(players);
  });

  it("sorts by attendance in both directions", () => {
    expect(sortPayslipPlayers(players, "attendance-desc").map((p) => p.member_id)).toEqual([1, 3, 2]);
    expect(sortPayslipPlayers(players, "attendance-asc").map((p) => p.member_id)).toEqual([2, 3, 1]);
  });

  it("sorts by payout, comparing amounts numerically rather than as strings", () => {
    // "1210000" sorts above "4600000" lexicographically, so a string compare
    // would silently invert this.
    expect(sortPayslipPlayers(players, "payslip-desc").map((p) => p.member_id)).toEqual([1, 3, 2]);
    expect(sortPayslipPlayers(players, "payslip-asc").map((p) => p.member_id)).toEqual([2, 3, 1]);
  });

  it("breaks ties on member id in a stable direction", () => {
    const tied = [player(9, 4, "0", false), player(2, 4, "0", false), player(5, 4, "0", false)];
    expect(sortPayslipPlayers(tied, "payslip-desc").map((p) => p.member_id)).toEqual([2, 5, 9]);
    expect(sortPayslipPlayers(tied, "payslip-asc").map((p) => p.member_id)).toEqual([2, 5, 9]);
  });

  it("does not mutate the input array", () => {
    const original = [...players];
    sortPayslipPlayers(players, "attendance-desc");
    expect(players).toEqual(original);
  });
});
