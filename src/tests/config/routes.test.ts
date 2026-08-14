import { describe, expect, it } from "vitest";

import { routes } from "@/config/routes";

describe("routes", () => {
  it("keeps the Discord callback under the Auth.js API route", () => {
    expect(routes.home).toBe("/");
    expect(routes.dashboard).toBe("/dashboard");
    expect(routes.auth.discordCallback).toBe("/api/auth/callback/discord");
  });
});
