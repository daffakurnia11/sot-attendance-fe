import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createRouteFetcher, isPermanentRouteError, RouteError } from "@/lib/route-fetcher";

const schema = z.object({ ok: z.boolean() });

describe("createRouteFetcher", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("parses a valid payload", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(createRouteFetcher("/api/thing", schema)()).resolves.toEqual({ ok: true });
  });

  it("requests without caching, so a poll cannot be served a stale copy", async () => {
    let init: RequestInit | undefined;
    vi.stubGlobal("fetch", async (_input: unknown, options?: RequestInit) => {
      init = options;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    await createRouteFetcher("/api/thing", schema)();
    expect(init?.cache).toBe("no-store");
  });

  it("throws a RouteError carrying the status", async () => {
    vi.stubGlobal("fetch", async () => new Response("", { status: 401 }));
    await expect(createRouteFetcher("/api/thing", schema)()).rejects.toThrow(RouteError);
    await expect(createRouteFetcher("/api/thing", schema)()).rejects.toMatchObject({ status: 401 });
  });

  it("rejects a payload that does not match the schema", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ ok: "yes" }), { status: 200 }));
    await expect(createRouteFetcher("/api/thing", schema)()).rejects.toThrow("invalid data");
  });
});

describe("isPermanentRouteError", () => {
  it("treats an expired token and a forbidden role as permanent", () => {
    // Polling must stop on these: retrying cannot fix either, and a 20-second
    // interval would otherwise fire ~180 rejected requests an hour.
    expect(isPermanentRouteError(new RouteError(401))).toBe(true);
    expect(isPermanentRouteError(new RouteError(403))).toBe(true);
  });

  it("treats an upstream failure and a network error as retryable", () => {
    expect(isPermanentRouteError(new RouteError(502))).toBe(false);
    expect(isPermanentRouteError(new RouteError(500))).toBe(false);
    expect(isPermanentRouteError(new TypeError("network"))).toBe(false);
  });
});
