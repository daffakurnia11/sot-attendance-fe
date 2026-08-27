import { describe, expect, it } from "vitest";

import { matchesPlayerName } from "@/components/organisms/dashboard/player-search-view";

describe("player search", () => {
  it("returns every CFX player when the search is blank", () => {
    expect(matchesPlayerName("SOT - Dior", "  ")).toBe(true);
  });

  it("matches player names like a case-insensitive LIKE percent query", () => {
    expect(matchesPlayerName("SOT - Dior", "dIoR")).toBe(true);
    expect(matchesPlayerName("SOT - Dior", "prince")).toBe(false);
  });
});
