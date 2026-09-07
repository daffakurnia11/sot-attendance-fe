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
  discordStatus: "invisible",
  serverUsername: "SOT - Member",
  serverCID: "CID1",
  serverStatus: "connected",
  cfxStatus: "polling",
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
  current_playtime_seconds: 0,
  total_playtime_seconds: 60,
  ...overrides,
});

const dashboard = (overrides: Partial<DashboardData>): DashboardData => ({
  discord_players: [],
  cfx_players: [],
  all_cfx_players: [],
  cfx_available: true,
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

  it("reads the Discord column from live presence, not from the game server", () => {
    const [online, invisible, unknown] = combinePlayerLogs(
      dashboard({
        discord_players: [
          apiPlayer({ member_id: 1, discord_status: "dnd", cfx_name: "" }),
          apiPlayer({ member_id: 2, discord_status: "invisible", cfx_name: "" }),
          apiPlayer({ member_id: 3, discord_status: "unknown", cfx_name: "" }),
        ],
      }),
    );
    expect(online.discordStatus).toBe("visible");
    expect(invisible.discordStatus).toBe("invisible");
    // Presence the bot never reached is not visible either, and the banner
    // above the table is what reports that the source was unavailable.
    expect(unknown.discordStatus).toBe("invisible");
  });

  it("carries the character id and the slot the visit holds", () => {
    const [row] = combinePlayerLogs(
      dashboard({ discord_players: [apiPlayer({ cid: "QNLLC342", server_id: "479", cfx_name: "" })] }),
    );
    expect(row).toMatchObject({ serverCID: "QNLLC342", serverID: "479", serverUsername: "" });
  });

  it("matches CFX case-insensitively and polls until the directory catches up", () => {
    const rows = combinePlayerLogs(
      dashboard({
        discord_players: [
          apiPlayer({ member_id: 1, character_name: "Matched", cfx_name: "SOT - Kenji" }),
          apiPlayer({ member_id: 2, character_name: "Waiting", cfx_name: "SOT - Pupaw" }),
        ],
        cfx_players: [{ id: 7, name: "sot - kenji", ping: 20 }],
      }),
    );
    expect(rows[0]).toMatchObject({ characterName: "Matched", cfxStatus: "connected", cfxServerID: 7, cfxPing: 20 });
    expect(rows[1]).toMatchObject({ characterName: "Waiting", cfxStatus: "polling" });
  });

  it("drops a player the game server no longer has, even while CFX still lists them", () => {
    const rows = combinePlayerLogs(
      dashboard({
        discord_players: [
          apiPlayer({ member_id: 1, character_name: "Playing", cfx_name: "SOT - Kenji", status: "connected" }),
          apiPlayer({ member_id: 2, character_name: "Left", cfx_name: "SOT - Ken", cid: "CID2", status: "offline" }),
        ],
        // The CFX directory is polled, so it still carries the player who left.
        cfx_players: [
          { id: 7, name: "SOT - Kenji", ping: 20 },
          { id: 8, name: "SOT - Ken", ping: 44 },
        ],
      }),
    );
    expect(rows.map(({ characterName }) => characterName)).toEqual(["Playing"]);
  });

  it("lists nobody when the game server has nobody, whatever CFX says", () => {
    const rows = combinePlayerLogs(
      dashboard({
        discord_players: [],
        cfx_players: [{ id: 8, name: "Guest", ping: 30 }],
      }),
    );
    expect(rows).toEqual([]);
  });
});
