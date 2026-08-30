import { describe, expect, it } from "vitest";

import type { CombinedPlayer } from "@/components/organisms/dashboard/player-directory";
import { sortCombinedPlayers } from "@/components/organisms/dashboard/player-directory";
import { combinePlayerLogs } from "@/components/organisms/dashboard/player-directory-live";

const player = (overrides: Partial<CombinedPlayer>): CombinedPlayer => ({
  id: "member-1",
  characterName: "Member",
  discordName: "Member",
  discordUsername: "member",
  discordStatus: "offline",
  cfxName: "",
  cfxConnected: false,
  cfxStatus: "not_set",
  ...overrides,
});

describe("combined player logs", () => {
  it("sorts CFX-connected rows first, then Discord presence", () => {
    const players = [
      player({ id: "offline" }),
      player({ id: "discord", discordStatus: "connected" }),
      player({ id: "cfx", cfxConnected: true }),
    ];
    expect(sortCombinedPlayers(players).map(({ id }) => id)).toEqual(["cfx", "discord", "offline"]);
  });

  it("matches CFX names case-insensitively and preserves unmatched live players", () => {
    const rows = combinePlayerLogs({
      discord_players: [
        {
          member_id: 1,
          username: "delta",
          display_name: "Delta",
          character_name: "Kenji",
          cfx_name: "SOT - Kenji",
          started_at: null,
          status: "offline",
          current_playtime_seconds: 0,
          total_playtime_seconds: 60,
        },
        {
          member_id: 2,
          username: "wait",
          display_name: "Waiting",
          character_name: "Waiting",
          cfx_name: "",
          started_at: "2026-08-27T07:00:00Z",
          status: "connecting",
          current_playtime_seconds: 30,
          total_playtime_seconds: 30,
        },
        {
          member_id: 3,
          username: "gone",
          display_name: "Gone",
          character_name: "Gone",
          cfx_name: "",
          started_at: null,
          status: "offline",
          current_playtime_seconds: 0,
          total_playtime_seconds: 90,
        },
        {
          member_id: 4,
          username: "old",
          display_name: "Old",
          character_name: "Old",
          cfx_name: "Old CFX Name",
          started_at: "2026-08-27T07:00:00Z",
          status: "connected",
          current_playtime_seconds: 60,
          total_playtime_seconds: 60,
        },
      ],
      cfx_players: [
        { id: 7, name: "sot - kenji", ping: 20 },
        { id: 8, name: "Guest", ping: 30 },
      ],
      all_cfx_players: [
        { id: 7, name: "sot - kenji", ping: 20 },
        { id: 8, name: "Guest", ping: 30 },
      ],
      cfx_available: true,
      player_threshold: 15,
      total_members: 4,
      total_playtime_seconds: 60,
      total_attended: 0,
      total_attendances: 0,
    });
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({
      cfxConnected: true,
      cfxServerID: 7,
      characterName: "Kenji",
      discordStatus: "invisible",
    });
    expect(rows[1]).toMatchObject({ discordStatus: "connecting", cfxStatus: "not_set", characterName: "Waiting" });
    expect(rows[2]).toMatchObject({ characterName: "Old", cfxName: "Old CFX Name", cfxStatus: "mismatched" });
    expect(rows[3]).toMatchObject({
      cfxConnected: true,
      cfxName: "Guest",
      characterName: "-",
      discordName: "-",
      discordStatus: "mismatched",
    });
    expect(rows.some(({ characterName }) => characterName === "Gone")).toBe(false);
  });
});
