import { describe, expect, it } from "vitest";

import { routes } from "@/config/routes";

describe("routes", () => {
  it("keeps the Discord callback under the Auth.js API route", () => {
    expect(routes.home).toBe("/");
    expect(routes.dashboard).toBe("/dashboard");
    expect(routes.myRecords).toBe("/my-records");
    expect(routes.attendanceRecap).toBe("/attendance-recap");
    expect(routes.attendanceCalendar).toBe("/attendance-calendar");
    expect(routes.payslipRecap).toBe("/payslip-recap");
    expect(routes.craftingCalculator).toBe("/crafting-calculator");
    expect(routes.players.discord).toBe("/players/discord");
    expect(routes.players.cfx).toBe("/players/cfx");
    expect(routes.settings).toBe("/settings");
    expect(routes.auth.discordCallback).toBe("/api/auth/callback/discord");
  });
});
