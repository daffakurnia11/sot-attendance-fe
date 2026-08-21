import { describe, expect, it } from "vitest";

import type { DirectoryPlayer } from "@/components/organisms/dashboard/player-directory";
import { sortDirectoryPlayers } from "@/components/organisms/dashboard/player-directory";

const players: DirectoryPlayer[] = [
  { id: "12", name: "Offline", identity: "", detail: "", status: "offline" },
  { id: "3", name: "Connecting", identity: "", detail: "", status: "connecting" },
  { id: "20", name: "Connected B", identity: "", detail: "", status: "connected" },
  { id: "2", name: "Connected A", identity: "", detail: "", status: "connected" },
];

describe("sortDirectoryPlayers", () => {
  it("sorts Discord default order by connected, connecting, then offline", () => {
    expect(sortDirectoryPlayers(players, "Discord", "default").map((player) => player.id)).toEqual([
      "2",
      "20",
      "3",
      "12",
    ]);
  });

  it("sorts CFX default order by numeric server ID", () => {
    expect(sortDirectoryPlayers(players, "CFX", "default").map((player) => player.id)).toEqual(["2", "3", "12", "20"]);
  });

  it("keeps explicit playtime sorting available", () => {
    const playtimePlayers = players.map((player, index) => ({ ...player, playtimeSeconds: index }));
    expect(sortDirectoryPlayers(playtimePlayers, "Discord", "highest").map((player) => player.id)).toEqual([
      "2",
      "20",
      "3",
      "12",
    ]);
  });
});
