"use client";

import { useState } from "react";

import {
  DataTable,
  DataTableCell,
  dataTableRowClassName,
  paginateItems,
  ResourceState,
  StatisticsSection,
  StatusIndicator,
  TablePagination,
} from "@/components/atoms";
import { useI18n } from "@/i18n";
import type { MemberRecords } from "@/services/member-records";

export function MemberRecordsView({ data }: { data: MemberRecords | null }) {
  const [playerPage, setPlayerPage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const { locale, t, translate } = useI18n();
  if (!data) return <ResourceState state="unavailable" message={t("Personal records could not be loaded.")} />;
  const attendanceRate = data.total_attendances ? Math.round((data.total_attended / data.total_attendances) * 100) : 0;
  const statistics = [
    { label: t("Total playtime"), value: formatDuration(data.total_playtime_seconds) },
    { label: t("Total attended"), value: String(data.total_attended) },
    { label: t("Attendance rate"), value: `${attendanceRate}%` },
  ];

  return (
    <>
      <StatisticsSection index="01" title="My Statistics" items={statistics} />

      <div className="mt-6">
        <DataTable
          title="Player Logs"
          code="PL"
          columns={[{ label: "Status" }, { label: "Started" }, { label: "Occurred" }, { label: "Playtime" }]}
          empty="No player activity recorded."
          footer={<TablePagination onPageChange={setPlayerPage} page={playerPage} total={data.player_logs.length} />}
        >
          {paginateItems(data.player_logs, playerPage).map((log) => (
            <tr className={dataTableRowClassName} key={log.id}>
              <DataTableCell>
                <Status label={translate(log.status)} value={log.status} />
              </DataTableCell>
              <DataTableCell>{formatDateTime(log.started_at, locale)}</DataTableCell>
              <DataTableCell>{formatDateTime(log.occurred_at, locale)}</DataTableCell>
              <DataTableCell>
                {log.playtime_seconds === null ? "—" : formatDuration(log.playtime_seconds)}
              </DataTableCell>
            </tr>
          ))}
        </DataTable>
      </div>

      <div className="mt-6">
        <DataTable
          title="Attendance Logs"
          code="AT"
          columns={[
            { label: "Date" },
            { label: "Window" },
            { label: "Playtime" },
            { label: "Required" },
            { label: "Result" },
          ]}
          empty="No attendance recorded."
          footer={
            <TablePagination
              onPageChange={setAttendancePage}
              page={attendancePage}
              total={data.attendance_logs.length}
            />
          }
        >
          {paginateItems(data.attendance_logs, attendancePage).map((log) => (
            <tr className={dataTableRowClassName} key={log.id}>
              <DataTableCell>{formatDate(log.attendance_start, locale)}</DataTableCell>
              <DataTableCell>
                {formatTime(log.attendance_start, locale)}–{formatTime(log.attendance_end, locale)}
              </DataTableCell>
              <DataTableCell>{formatDuration(log.playtime_seconds)}</DataTableCell>
              <DataTableCell>{formatDuration(log.required_playtime_seconds)}</DataTableCell>
              <DataTableCell>
                <Status
                  label={translate(log.is_attended ? "attended" : "not attended")}
                  value={log.is_attended ? "attended" : "not attended"}
                />
              </DataTableCell>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  const positive = ["connected", "attended"].includes(value);
  const pending = value === "connecting";
  return <StatusIndicator tone={positive ? "success" : pending ? "warning" : "danger"}>{label}</StatusIndicator>;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
function formatDate(value: string, locale: "en" | "id") {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}
function formatTime(value: string, locale: "en" | "id") {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}
function formatDateTime(value: string | null, locale: "en" | "id") {
  return value ? `${formatDate(value, locale)}, ${formatTime(value, locale)}` : "—";
}
