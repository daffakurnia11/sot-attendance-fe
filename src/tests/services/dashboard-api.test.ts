import { describe, expect, it } from "vitest";

import { fetchDashboard } from "@/services/dashboard";

const valid = {
  discord_players: [
    {
      member_id: 1,
      discord_user_id: "111",
      username: "delta",
      display_name: "Delta",
      character_name: "",
      cfx_name: "SOT - Delta",
      cid: "CID1",
      server_id: null,
      started_at: null,
      status: "offline",
      discord_status: "offline",
      discord_playing: false,
      current_playtime_seconds: 0,
      total_playtime_seconds: 5400,
    },
  ],
  player_threshold: 15,
  total_members: 4,
  total_playtime_seconds: 5400,
  total_attended: 2,
  total_attendances: 3,
  cfx_players: [],
  all_cfx_players: [],
  cfx_available: true,
  discord_presence_available: true,
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
