import { describe, expect, it } from "vitest";

import type { CombinedPlayer } from "@/components/organisms/dashboard/player-directory";
import { sortCombinedPlayers } from "@/components/organisms/dashboard/player-directory";
import { combinePlayerLogs } from "@/components/organisms/dashboard/player-directory-live";
import type { DashboardData } from "@/services/dashboard";

const player = (overrides: Partial<CombinedPlayer>): CombinedPlayer => ({
  id: "character-CID1",
  characterName: "Member",
  discordName: "Member",
  discordUsername: "member",
  discordStatus: "offline / invisible",
  serverUsername: "SOT - Member",
  serverCID: "CID1",
  serverStatus: "connected",
  ...overrides,
});

type APIPlayer = DashboardData["discord_players"][number];

const apiPlayer = (overrides: Partial<APIPlayer>): APIPlayer => ({
  member_id: 1,
  discord_user_id: "111",
  username: "delta",
  display_name: "Delta",
  character_name: "Kenji",
  cfx_name: "SOT - Kenji",
  cid: "CID1",
  server_id: "42",
  started_at: null,
  status: "connected",
  discord_status: "online",
  discord_playing: true,
  discord_connecting: false,
  current_playtime_seconds: 0,
  total_playtime_seconds: 60,
  ...overrides,
});

const dashboard = (overrides: Partial<DashboardData>): DashboardData => ({
  discord_players: [],
  discord_presence_available: true,
  player_threshold: 15,
  total_members: 0,
  total_playtime_seconds: 0,
  total_attended: 0,
  total_attendances: 0,
  ...overrides,
});

describe("combined player logs", () => {
  it("orders connected before connecting", () => {
    const players = [
      player({ id: "connecting", serverStatus: "connecting" }),
      player({ id: "connected", serverStatus: "connected" }),
    ];
    expect(sortCombinedPlayers(players).map(({ id }) => id)).toEqual(["connected", "connecting"]);
  });

  it("lists only players the game server has on now", () => {
    const rows = combinePlayerLogs(
      dashboard({
        discord_players: [
          apiPlayer({ member_id: 1, character_name: "OnServer", status: "connected" }),
          apiPlayer({ member_id: 2, character_name: "Loading", status: "connecting", cfx_name: "" }),
          apiPlayer({ member_id: 3, character_name: "Gone", status: "offline", cfx_name: "" }),
        ],
      }),
    );
    expect(rows.map(({ characterName }) => characterName)).toEqual(["OnServer", "Loading"]);
  });

  it("reads the Discord column from the activity, not from the presence status", () => {
    const [playing, joining, elsewhere, unreachable] = combinePlayerLogs(
      dashboard({
        discord_players: [
          // Busy, but the activity names the server: they are on it.
          apiPlayer({ member_id: 1, discord_status: "dnd", discord_playing: true, cfx_name: "" }),
          apiPlayer({
            member_id: 2,
            discord_status: "online",
            discord_playing: true,
            discord_connecting: true,
            cfx_name: "",
          }),
          // Online, but playing something else.
          apiPlayer({ member_id: 3, discord_status: "online", discord_playing: false, cfx_name: "" }),
          apiPlayer({ member_id: 4, discord_status: "unknown", discord_playing: false, cfx_name: "" }),
        ],
      }),
    );
    expect(playing.discordStatus).toBe("connected");
    expect(joining.discordStatus).toBe("connecting");
    expect(elsewhere.discordStatus).toBe("no CR activity");
    // Missing presence stays unknown.
    expect(unreachable.discordStatus).toBe("unknown");
  });

  it("carries the character id and the slot the visit holds", () => {
    const [row] = combinePlayerLogs(
      dashboard({ discord_players: [apiPlayer({ cid: "QNLLC342", server_id: "479", cfx_name: "" })] }),
    );
    expect(row).toMatchObject({ serverCID: "QNLLC342", serverID: "479", serverUsername: "" });
  });

  it("distinguishes offline from visible absence and unavailable presence", () => {
    const rows = combinePlayerLogs(
      dashboard({
        discord_players: [
          apiPlayer({ discord_status: "offline", discord_playing: true }),
          apiPlayer({ discord_status: "idle", discord_playing: false }),
          apiPlayer({ discord_status: "dnd", discord_playing: false }),
        ],
      }),
    );
    expect(rows.map((row) => row.discordStatus)).toEqual(["offline / invisible", "no CR activity", "no CR activity"]);
    expect(
      combinePlayerLogs(dashboard({ discord_players: [apiPlayer({})], discord_presence_available: false }))[0]
        .discordStatus,
    ).toBe("unknown");
    expect(rows.every((row) => row.serverStatus === "connected")).toBe(true);
  });
});
