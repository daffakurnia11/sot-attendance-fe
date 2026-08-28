import type { AttendanceReport } from "@/services/attendance";
import { getMemberTotalPlaytime } from "@/services/attendance";
import type { PayslipReport } from "@/services/payslip";

export type ExportSheet = Readonly<{
  name: string;
  columns: readonly string[];
  rows: readonly (readonly (string | number | boolean)[])[];
}>;

export function buildAttendanceSheet(report: AttendanceReport): ExportSheet {
  const attendanceDayCount = report.attendance_days.length;
  const members = [...report.members].sort((left, right) => {
    const leftRate = attendanceDayCount ? left.total_attended / attendanceDayCount : 0;
    const rightRate = attendanceDayCount ? right.total_attended / attendanceDayCount : 0;
    return (
      rightRate - leftRate ||
      getMemberTotalPlaytime(right) - getMemberTotalPlaytime(left) ||
      left.member_id - right.member_id
    );
  });

  return {
    name: "Attendance",
    columns: [
      "Character Name",
      "Discord Name",
      "Discord Username",
      ...report.period_dates,
      "Playtime",
      "Total Attendance",
      "Attendance Rate",
    ],
    rows: members.map((member) => {
      const records = new Map(member.records.map((record) => [record.date, record]));
      const rate = attendanceDayCount ? member.total_attended / attendanceDayCount : 0;
      return [
        member.character_name || "-",
        member.display_name,
        member.username,
        ...report.period_dates.map((date) => {
          const record = records.get(date);
          return record ? (record.is_attended ? "✓" : "✗") : "—";
        }),
        formatDuration(getMemberTotalPlaytime(member)),
        member.total_attended,
        rate,
      ];
    }),
  };
}

export function buildPayslipSheets(report: PayslipReport): ExportSheet[] {
  return [
    {
      name: "Summary",
      columns: ["Metric", "Value"],
      rows: [
        ["Period", `${report.period_start} - ${report.period_end}`],
        ["Payment Contract", Number(report.payment_contract)],
        ["Eligible Players", report.eligible_players],
        ["Total Players", report.total_players],
        ["Attendance Minimum", report.attendance_minimum],
        ["Attendance Maximum", report.attendance_maximum],
        ["Total Payout", Number(report.total_payout)],
      ],
    },
    {
      name: "Payslips",
      columns: ["Character Name", "Discord Name", "Discord Username", "Attendance", "Eligible", "Payslip"],
      rows: report.players.map((player) => [
        player.character_name || "-",
        player.display_name,
        player.username,
        player.attended_days,
        player.eligible,
        Number(player.payout),
      ]),
    },
  ];
}

export async function exportXlsx(filename: string, sheets: readonly ExportSheet[]) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SOT Attendance";
  workbook.created = new Date();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);
    worksheet.addRow([...sheet.columns]);
    for (const row of sheet.rows) worksheet.addRow([...row]);
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columns.length } };
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFD75A" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF17130B" } };
    });
    worksheet.columns.forEach((column) => {
      let width = 12;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        width = Math.max(width, String(cell.value ?? "").length + 2);
      });
      column.width = Math.min(width, 42);
    });
    if (sheet.name === "Attendance") {
      worksheet.getColumn(sheet.columns.length).numFmt = "0.0%";
      const firstDateColumn = 4;
      const lastDateColumn = sheet.columns.length - 3;
      for (let row = 2; row <= worksheet.rowCount; row += 1) {
        for (let column = firstDateColumn; column <= lastDateColumn; column += 1) {
          styleAttendanceRecordCell(worksheet.getCell(row, column));
        }
      }
    }
    if (sheet.name === "Summary") {
      for (const row of [3, 8]) worksheet.getCell(row, 2).numFmt = '"Rp. "#,##0';
    }
    if (sheet.name === "Payslips") worksheet.getColumn(6).numFmt = '"Rp. "#,##0';
  }

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${filename}.xlsx`,
  );
}

function styleAttendanceRecordCell(cell: import("exceljs").Cell) {
  cell.alignment = { horizontal: "center", vertical: "middle" };

  if (cell.value === "✓") {
    cell.font = { bold: true, color: { argb: "FF34D399" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF123C32" } };
  } else if (cell.value === "✗") {
    cell.font = { bold: true, color: { argb: "FFF87171" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3C1D1D" } };
  } else {
    cell.font = { color: { argb: "FF8F887A" } };
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
