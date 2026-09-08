import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { fetchPeriodReport, formatPeriod, shiftMonth } from "@/lib/report-period";

const schema = z.object({ month: z.string(), members: z.array(z.string()) });

describe("report period requests", () => {
  it("crosses year boundaries without changing the contract period label", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(formatPeriod("2026-08-28", "2026-09-27", "en")).toBe("Aug 28, 2026 – Sep 27, 2026");
  });

  it("uses the requested month and forwards cancellation", async () => {
    const controller = new AbortController();
    const fetcher = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ month: "2026-09", members: [] })));
    await expect(fetchPeriodReport("/api/attendance", "2026-09", schema, controller.signal, fetcher)).resolves.toEqual({
      month: "2026-09",
      members: [],
    });
    expect(fetcher).toHaveBeenCalledWith("/api/attendance?month=2026-09", {
      cache: "no-store",
      signal: controller.signal,
    });
  });

  it("can retry an initial failure without knowing a month", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ month: "2026-09", members: [] })));
    await fetchPeriodReport("/api/attendance", undefined, schema, new AbortController().signal, fetcher);
    expect(fetcher.mock.calls[0]?.[0]).toBe("/api/attendance");
  });

  it("rejects unsuccessful and malformed reports instead of replacing visible data", async () => {
    const signal = new AbortController().signal;
    await expect(
      fetchPeriodReport("/api/payslips", "2026-09", schema, signal, async () => new Response("{}", { status: 403 })),
    ).rejects.toThrow("403");
    await expect(
      fetchPeriodReport("/api/payslips", "2026-09", schema, signal, async () => new Response('{"month":"2026-09"}')),
    ).rejects.toThrow();
  });

  it("propagates aborted requests", async () => {
    const signal = AbortSignal.abort();
    await expect(
      fetchPeriodReport("/api/attendance", undefined, schema, signal, async (_url, init) => {
        init?.signal?.throwIfAborted();
        return new Response("{}");
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
