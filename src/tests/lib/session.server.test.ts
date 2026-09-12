import { beforeEach, describe, expect, it, vi } from "vitest";

const getToken = vi.fn();
const auth = vi.fn();
const headers = vi.fn(async () => new Headers());

vi.mock("next-auth/jwt", () => ({ getToken }));
vi.mock("@/auth", () => ({ auth }));
vi.mock("next/headers", () => ({ headers }));
vi.mock("@/lib/env.server", () => ({
  goAPIURL: "http://api.test",
  serverEnv: { AUTH_SECRET: "x".repeat(32) },
  useSecureCookies: false,
}));

const { loadForMember, memberRoute } = await import("@/lib/session.server");

const request = () => new Request("http://app.test/api/thing?month=2026-08");

beforeEach(() => {
  getToken.mockReset();
  auth.mockReset();
  auth.mockResolvedValue({ user: { member: { is_admin: true } } });
});

describe("memberRoute", () => {
  it("answers 401 without ever running the handler when there is no app token", async () => {
    getToken.mockResolvedValue(null);
    const handle = vi.fn();

    const response = await memberRoute("Thing unavailable", handle)(request());

    expect(response.status).toBe(401);
    expect(handle).not.toHaveBeenCalled();
  });

  it("answers 403 without running the handler when an admin-only route sees a member", async () => {
    getToken.mockResolvedValue({ appAccessToken: "app-token" });
    auth.mockResolvedValue({ user: { member: { is_admin: false } } });
    const handle = vi.fn();

    const response = await memberRoute("Thing unavailable", handle, { admin: true })(request());

    expect(response.status).toBe(403);
    expect(handle).not.toHaveBeenCalled();
  });

  it("passes the token and request through and returns the handler response untouched", async () => {
    getToken.mockResolvedValue({ appAccessToken: "app-token" });

    const response = await memberRoute("Thing unavailable", async (accessToken, incoming) =>
      Response.json({ accessToken, month: new URL(incoming.url).searchParams.get("month") }),
    )(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ accessToken: "app-token", month: "2026-08" });
  });

  it("reports a thrown upstream failure as 502 but leaves a returned validation response alone", async () => {
    getToken.mockResolvedValue({ appAccessToken: "app-token" });

    const upstream = await memberRoute("Thing unavailable", async () => {
      throw new Error("connect ECONNREFUSED");
    })(request());
    const invalid = await memberRoute("Thing unavailable", async () =>
      Response.json({ error: "Invalid thing" }, { status: 422 }),
    )(request());

    expect(upstream.status).toBe(502);
    expect(await upstream.json()).toEqual({ error: "Thing unavailable" });
    expect(invalid.status).toBe(422);
  });
});

describe("loadForMember", () => {
  it("returns null without reading when there is no app token", async () => {
    getToken.mockResolvedValue(null);
    const read = vi.fn();

    expect(await loadForMember("/dashboard", read)).toBeNull();
    expect(read).not.toHaveBeenCalled();
  });

  it("reads with the configured API URL and token, and swallows a failure into null", async () => {
    getToken.mockResolvedValue({ appAccessToken: "app-token" });

    const loaded = await loadForMember("/dashboard", async (apiURL, accessToken) => ({ apiURL, accessToken }));
    const failed = await loadForMember("/dashboard", async () => {
      throw new Error("upstream down");
    });

    expect(loaded).toEqual({ apiURL: "http://api.test", accessToken: "app-token" });
    expect(failed).toBeNull();
  });
});
