import { describe, expect, it } from "vitest";

import { fetchPayslips } from "@/services/payslip";

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
