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
  discord_connecting: false,
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

  it("reads the Discord column from the activity, not from the presence status", () => {
    const [playing, joining, elsewhere, unreachable] = combinePlayerLogs(
      dashboard({
        discord_players: [
          // Busy, but the activity names the server: they are on it.
          apiPlayer({ member_id: 1, discord_status: "dnd", discord_playing: true, cfx_name: "" }),
          apiPlayer({ member_id: 2, discord_status: "online", discord_playing: true, discord_connecting: true, cfx_name: "" }),
          // Online, but playing something else.
          apiPlayer({ member_id: 3, discord_status: "online", discord_playing: false, cfx_name: "" }),
          apiPlayer({ member_id: 4, discord_status: "unknown", discord_playing: false, cfx_name: "" }),
        ],
      }),
    );
    expect(playing.discordStatus).toBe("connected");
    expect(joining.discordStatus).toBe("connecting");
    expect(elsewhere.discordStatus).toBe("invisible");
    // Presence the bot never reached reads invisible too, and the banner above
    // the table is what reports that the source was unavailable.
    expect(unreachable.discordStatus).toBe("invisible");
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

  it("keeps a departed player's own row out, listing them only as an unreported roster entry", () => {
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
    // Their own visit row is gone, but the roster entry still names them: CFX
    // reports only a name, and server_members knows the character behind it.
    expect(rows.map(({ characterName }) => characterName)).toEqual(["Playing", "Left"]);
    // What remains is the roster entry, which the next CFX read drops. CFX
    // lags an exit by up to a poll interval and it is the only witness that a
    // player is on the server at all, so this is the cost of listing a player
    // whose connect event the webhook missed.
    expect(rows[1]).toMatchObject({ id: "cfx-8", serverUsername: "SOT - Ken", serverStatus: "unreported" });
    // No slot, though: a server id belongs to a visit the webhook never opened.
    expect(rows[1].serverID).toBeUndefined();
  });

  // The webhook drops a connect event now and then, which used to make the
  // table show fewer players than the roster the Player Search page reads.
  it("shows a roster player the webhook never reported, marked unreported", () => {
    const rows = combinePlayerLogs(
      dashboard({
        discord_players: [],
        cfx_players: [{ id: 8, name: "Guest", ping: 30 }],
      }),
    );
    expect(rows).toMatchObject([
      { id: "cfx-8", serverUsername: "Guest", serverStatus: "unreported", cfxStatus: "connected", cfxPing: 30 },
    ]);
    // It carries no attendance of its own: the webhook is the only authority
    // on that, and it never opened a visit for this player.
    expect(rows[0]).toMatchObject({ characterName: "-", serverCID: "", serverID: undefined });
  });

  // A player who has played before but is not on now must not suppress their
  // own roster entry: discord_players carries a row per character for all time,
  // so keying off it hid every returning player behind their own history.
  it("lists a returning player the webhook has not reported this visit", () => {
    const rows = combinePlayerLogs(
      dashboard({
        discord_players: [apiPlayer({ member_id: 2, character_name: "Back", cfx_name: "SOT - Ken", status: "offline" })],
        cfx_players: [{ id: 8, name: "sot - ken", ping: 44 }],
      }),
    );
    // Joined to server_members on the CFX name, so the character, the Discord
    // account and the CID all come through; only the visit is missing.
    expect(rows).toMatchObject([
      {
        id: "cfx-8",
        characterName: "Back",
        discordName: "Delta",
        discordUsername: "delta",
        serverCID: "CID1",
        // The stored spelling wins over whatever CFX reported.
        serverUsername: "SOT - Ken",
        serverStatus: "unreported",
      },
    ]);
  });

  // A player the server has never reported has no record to join to, so the
  // roster name is all there is.
  it("lists a roster player server_members has never seen, with the name alone", () => {
    const rows = combinePlayerLogs(
      dashboard({ discord_players: [], cfx_players: [{ id: 9, name: "Stranger", ping: 30 }] }),
    );
    expect(rows).toMatchObject([
      { id: "cfx-9", characterName: "-", discordName: "-", serverUsername: "Stranger", serverCID: "" },
    ]);
  });

  // An open visit is what suppresses the roster entry, so a player the webhook
  // did report is never listed twice.
  it("does not list a player twice when the webhook already has their visit", () => {
    const rows = combinePlayerLogs(
      dashboard({
        discord_players: [apiPlayer({ member_id: 1, character_name: "Playing", cfx_name: "SOT - Kenji", status: "connected" })],
        cfx_players: [{ id: 7, name: "sot - kenji", ping: 20 }],
      }),
    );
    expect(rows.map(({ characterName }) => characterName)).toEqual(["Playing"]);
  });
});
