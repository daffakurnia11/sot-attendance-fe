import { describe, expect, it } from "vitest";

import { routes } from "@/config/routes";

describe("routes", () => {
  it("keeps the Discord callback under the Auth.js API route", () => {
    expect(routes.home).toBe("/");
    expect(routes.dashboard).toBe("/dashboard");
    expect(routes.myRecords).toBe("/my-records");
    expect(routes.attendance).toBe("/attendance");
    expect(routes.attendanceTabs.recap).toBe("/attendance?view=recap");
    expect(routes.attendanceTabs.calendar).toBe("/attendance?view=calendar");
    expect(routes.attendanceRecap).toBe("/attendance-recap");
    expect(routes.attendanceCalendar).toBe("/attendance-calendar");
    expect(routes.payslipRecap).toBe("/payslip-recap");
    expect(routes.playerSearch).toBe("/player-search");
    expect(routes.craftingCalculator).toBe("/crafting-calculator");
    expect(routes.players.home).toBe("/players");
    expect(routes.players.tabs.discord).toBe("/players?view=discord");
    expect(routes.players.tabs.cfx).toBe("/players?view=cfx");
    expect(routes.players.discord).toBe("/players/discord");
    expect(routes.players.cfx).toBe("/players/cfx");
    expect(routes.settings).toBe("/settings");
    expect(routes.auth.discordCallback).toBe("/api/auth/callback/discord");
  });
});
