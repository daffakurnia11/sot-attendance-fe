import { describe, expect, it, vi } from "vitest";

import { fetchMemberRecords } from "@/services/member-records";

describe("fetchMemberRecords", () => {
  it("loads authenticated personal records", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      total_playtime_seconds: 3600, total_attended: 1, total_attendances: 1,
      player_logs: [{ id: 1, status: "disconnected", started_at: "2026-08-14T14:00:00Z", occurred_at: "2026-08-14T15:00:00Z", playtime_seconds: 3600 }],
      attendance_logs: [{ id: 2, attendance_start: "2026-08-14T14:00:00Z", attendance_end: "2026-08-14T18:00:00Z", playtime_seconds: 3600, required_playtime_seconds: 1800, is_attended: true }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const result = await fetchMemberRecords("http://api.test", "token", fetcher as typeof fetch);
    expect(result.total_attended).toBe(1);
    expect(fetcher).toHaveBeenCalledWith(new URL("http://api.test/api/v1/me/records"), expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer token" }) }));
  });
});
