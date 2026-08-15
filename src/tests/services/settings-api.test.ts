import { describe, expect, it } from "vitest";

import { fetchSettings, formatIDRInput, normalizeCurrencyInput, settingsSchema, updateSettings } from "@/services/settings";

const valid = { start_attendance: "21:00", end_attendance: "01:00", playtime_threshold: "90m", player_threshold: "15", payment_contract: "8000000", attendance_minimum: "24", attendance_maximum: "30", start_date_contract: "28", is_admin: true };

describe("settings API", () => {
  it("formats IDR input without changing stored digits", () => {
    expect(formatIDRInput("8000000")).toBe("8.000.000");
    expect(normalizeCurrencyInput("Rp. 8.000.000")).toBe("8000000");
  });

  it("rejects inverted attendance day range", () => {
    expect(settingsSchema.safeParse({ ...valid, attendance_minimum: "30", attendance_maximum: "24" }).success).toBe(false);
  });

  it("rejects invalid contract start date", () => {
    expect(settingsSchema.safeParse({ ...valid, start_date_contract: "32" }).success).toBe(false);
  });

  it("validates loaded settings", async () => {
    const fetcher = async () => new Response(JSON.stringify(valid));
    await expect(fetchSettings("http://api.test", "token", fetcher as typeof fetch)).resolves.toEqual(valid);
  });

  it("sends update and surfaces API validation messages", async () => {
    const success = async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("PATCH");
      return new Response(JSON.stringify(valid), { status: 200 });
    };
    await expect(updateSettings("http://api.test", "token", valid, success as typeof fetch)).resolves.toEqual(valid);

    const failure = async () => new Response(JSON.stringify({ error: { message: "times must differ" } }), { status: 422 });
    await expect(updateSettings("http://api.test", "token", valid, failure as typeof fetch)).rejects.toThrow("times must differ");
  });
});
