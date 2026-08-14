import { describe, expect, it } from "vitest";

import { content } from "@/data";

describe("auth content", () => {
  it("exposes only Discord as the login provider", () => {
    expect(content.auth.signIn).toContain("Discord");
    expect(content.auth.description).toContain("No password");
  });

  it("explains how an unregistered Discord member becomes eligible", () => {
    expect(content.auth.memberNotRegisteredError).toContain("FiveM server once");
  });
});
