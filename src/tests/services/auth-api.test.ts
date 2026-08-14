import { describe, expect, it, vi } from "vitest";

import { exchangeDiscordToken } from "@/services/auth";

const successPayload = {
  access_token: "app-jwt",
  token_type: "Bearer",
  expires_at: "2026-08-14T10:15:00Z",
  member: {
    id: 7,
    discord_user_id: "123456",
    username: "delta",
    display_name: "Delta",
    character_name: "D. Kilo",
  },
};

describe("exchangeDiscordToken", () => {
  it("exchanges Discord token through server-only Go API URL", async () => {
    const fetcher = vi.fn(async () => Response.json(successPayload)) as unknown as typeof fetch;

    const result = await exchangeDiscordToken("http://api:8080", "discord-secret", fetcher);

    expect(result.member.id).toBe(7);
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, options] = vi.mocked(fetcher).mock.calls[0];
    expect(String(url)).toBe("http://api:8080/api/v1/auth/discord");
    expect(options?.headers).toMatchObject({ Authorization: "Bearer discord-secret" });
    expect(String(url)).not.toContain("discord-secret");
  });

  it("preserves safe backend error code without response message", async () => {
    const fetcher = vi.fn(async () =>
      Response.json(
        { error: { code: "MEMBER_NOT_REGISTERED", message: "internal detail" } },
        { status: 403 },
      ),
    ) as unknown as typeof fetch;

    await expect(
      exchangeDiscordToken("http://api:8080", "discord-secret", fetcher),
    ).rejects.toMatchObject({
      code: "MEMBER_NOT_REGISTERED",
      status: 403,
      message: "MEMBER_NOT_REGISTERED",
    });
  });

  it("rejects malformed success responses", async () => {
    const fetcher = vi.fn(async () => Response.json({ access_token: "token" })) as unknown as typeof fetch;

    await expect(
      exchangeDiscordToken("http://api:8080", "discord-secret", fetcher),
    ).rejects.toMatchObject({ code: "INVALID_BACKEND_RESPONSE", status: 502 });
  });

  it("maps network failures without leaking transport errors", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("connect ECONNREFUSED secret-host");
    }) as unknown as typeof fetch;

    await expect(
      exchangeDiscordToken("http://api:8080", "discord-secret", fetcher),
    ).rejects.toMatchObject({ code: "BACKEND_UNAVAILABLE", status: 503 });
  });
});
