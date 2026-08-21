import { describe, expect, it } from "vitest";

import { memberProfileSchema, updateMemberProfile } from "@/services/member-profile";

describe("member profile API", () => {
  it("validates character names", () => {
    expect(memberProfileSchema.safeParse({ character_name: "Kenji Nakamura" }).success).toBe(true);
    expect(memberProfileSchema.safeParse({ character_name: "" }).success).toBe(false);
    expect(memberProfileSchema.safeParse({ character_name: "bad\nname" }).success).toBe(false);
  });
  it("updates authenticated profile contract", async () => {
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => new Response(init?.body, { status: 200 });
    await expect(
      updateMemberProfile("http://api.test", "token", { character_name: "Kenji" }, fetcher as typeof fetch),
    ).resolves.toEqual({ character_name: "Kenji" });
  });
});
