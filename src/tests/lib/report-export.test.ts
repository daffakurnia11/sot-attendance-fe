import { describe, expect, it } from "vitest";

import { buildAttendanceSheet, buildPayslipSheets } from "@/lib/report-export";
import type { AttendanceReport } from "@/services/attendance";
import type { PayslipReport } from "@/services/payslip";

describe("report export data", () => {
  it("sorts attendance by rate then playtime and distinguishes record states with symbols", () => {
    const dates = Array.from({ length: 28 }, (_, index) => `2026-08-${String(index + 1).padStart(2, "0")}`);
    const report: AttendanceReport = {
      month: "2026-08",
      days_in_month: 28,
      period_start: dates[0],
      period_end: dates[27],
      period_dates: dates,
      attendance_days: dates.slice(0, 2),
      total_attended: 1,
      total_opportunities: 2,
      members: [
        {
          member_id: 1,
          username: "delta",
          display_name: "Delta",
          character_name: "Kenji",
          total_attended: 1,
          records: [
            { date: dates[0], is_attended: true, playtime_seconds: 3600 },
            { date: dates[1], is_attended: false, playtime_seconds: 0 },
          ],
        },
        {
          member_id: 2,
          username: "alpha",
          display_name: "Alpha",
          character_name: "Alpha",
          total_attended: 1,
          records: [{ date: dates[0], is_attended: true, playtime_seconds: 7200 }],
        },
        {
          member_id: 3,
          username: "bravo",
          display_name: "Bravo",
          character_name: "Bravo",
          total_attended: 2,
          records: [
            { date: dates[0], is_attended: true, playtime_seconds: 1800 },
            { date: dates[1], is_attended: true, playtime_seconds: 1800 },
          ],
        },
      ],
    };

    const sheet = buildAttendanceSheet(report);
    expect(sheet.rows).toHaveLength(3);
    expect(sheet.rows.map((row) => row[0])).toEqual(["Bravo", "Alpha", "Kenji"]);
    expect(sheet.rows[2].slice(3, 6)).toEqual(["✓", "✗", "—"]);
    expect(sheet.rows[2].at(-1)).toBe(0.5);
  });

  it("exports payslip summary and every player using numeric amounts", () => {
    const report: PayslipReport = {
      month: "2026-08",
      period_start: "2026-08-01",
      period_end: "2026-08-28",
      payment_contract: "8000000",
      attendance_minimum: 20,
      attendance_maximum: 28,
      total_players: 1,
      eligible_players: 1,
      total_payout: "8000000",
      players: [
        {
          member_id: 1,
          username: "delta",
          display_name: "Delta",
          character_name: "Kenji",
          attended_days: 28,
          eligible: true,
          payout: "8000000",
        },
      ],
    };

    const sheets = buildPayslipSheets(report);
    expect(sheets.map((sheet) => sheet.name)).toEqual(["Summary", "Payslips"]);
    expect(sheets[1].rows[0]).toEqual(["Kenji", "Delta", "delta", 28, true, 8000000]);
  });
});
