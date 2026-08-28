import { describe, expect, it } from "vitest";

import { fetchMemberProfile, memberProfileSchema, updateMemberProfile } from "@/services/member-profile";

describe("member profile API", () => {
  it("validates character names", () => {
    expect(memberProfileSchema.safeParse({ character_name: "Kenji Nakamura", cfx_name: "SOT - Kenji" }).success).toBe(
      true,
    );
    expect(memberProfileSchema.safeParse({ character_name: "Kenji Nakamura", cfx_name: "" }).success).toBe(true);
    expect(memberProfileSchema.safeParse({ character_name: "", cfx_name: "" }).success).toBe(false);
    expect(memberProfileSchema.safeParse({ character_name: "Kenji", cfx_name: "bad\nname" }).success).toBe(false);
  });
  it("updates authenticated profile contract", async () => {
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => new Response(init?.body, { status: 200 });
    await expect(
      updateMemberProfile(
        "http://api.test",
        "token",
        { character_name: "Kenji", cfx_name: "SOT - Kenji" },
        fetcher as typeof fetch,
      ),
    ).resolves.toEqual({ character_name: "Kenji", cfx_name: "SOT - Kenji" });
  });
  it("loads current authenticated profile", async () => {
    const fetcher = async () => Response.json({ character_name: "Kenji", cfx_name: "SOT - Kenji" });
    await expect(fetchMemberProfile("http://api.test", "token", fetcher as typeof fetch)).resolves.toEqual({
      character_name: "Kenji",
      cfx_name: "SOT - Kenji",
    });
  });
});
