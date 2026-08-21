import { describe, expect, it } from "vitest";

import { fetchDashboard } from "@/services/dashboard";

const valid = {
  discord_players: [
    {
      member_id: 1,
      username: "delta",
      display_name: "Delta",
      character_name: "",
      started_at: null,
      status: "offline",
      total_playtime_seconds: 5400,
    },
  ],
  player_threshold: 15,
  total_members: 4,
  total_playtime_seconds: 5400,
  total_attended: 2,
  total_attendances: 3,
  cfx_players: [],
  cfx_available: true,
};

describe("fetchDashboard", () => {
  it("validates dashboard response", async () => {
    const fetcher = async () => new Response(JSON.stringify(valid), { status: 200 });
    await expect(fetchDashboard("http://api.test", "token", fetcher as typeof fetch)).resolves.toEqual(valid);
  });

  it("rejects invalid responses", async () => {
    const fetcher = async () => new Response(JSON.stringify({ ...valid, total_members: -1 }), { status: 200 });
    await expect(fetchDashboard("http://api.test", "token", fetcher as typeof fetch)).rejects.toThrow("invalid data");
  });
});
