import { describe, expect, it } from "vitest";

import { translateMessage } from "@/i18n/i18n-provider";
import { en, id } from "@/i18n/messages";

describe("translations", () => {
  it("keeps Indonesian dictionary aligned with English source keys", () => {
    expect(Object.keys(id).sort()).toEqual(Object.keys(en).sort());
  });

  it("translates Indonesian UI copy", () => {
    expect(translateMessage("id", "Attendance Recap")).toBe("Rekap Absensi");
    expect(translateMessage("id", "connected")).toBe("terhubung");
  });

  it("interpolates translated variables", () => {
    expect(translateMessage("id", "{count} attendance days", { count: 3 })).toBe("3 hari absensi");
  });

  it("preserves English product terminology", () => {
    expect(translateMessage("id", "Dashboard")).toBe("Dashboard");
    expect(translateMessage("id", "Playtime")).toBe("Playtime");
    expect(translateMessage("id", "Payslip")).toBe("Payslip");
  });
});
