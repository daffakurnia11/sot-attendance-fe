"use client";

import { Alert } from "antd";
import { useRef, useState } from "react";

import { OptionDropdown } from "@/components/atoms";
import { DashboardPage } from "@/components/templates";
import type { AttendanceReport, AttendanceSort } from "@/services/attendance";
import { getAttendanceSummary, getLatestAttendanceSummary, getMemberTotalPlaytime, sortAttendanceMembers } from "@/services/attendance";

export function AttendanceView({ initialData, personal = false }: { initialData: AttendanceReport | null; personal?: boolean }) {
  const [report, setReport] = useState(initialData);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AttendanceSort>("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(!initialData);
  const requestController = useRef<AbortController | null>(null);

  async function changeMonth(offset: number) {
    if (!report) return;
    const target = shiftMonth(report.month, offset);
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setError(false);
    try {
      const endpoint = personal ? "/api/attendance/me" : "/api/attendance";
      const response = await fetch(`${endpoint}?month=${encodeURIComponent(target)}`, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("request failed");
      setReport(await response.json() as AttendanceReport);
    } catch (requestError) {
      if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError(true);
    } finally {
      if (requestController.current === controller) setLoading(false);
    }
  }

  if (!report) return <div className="w-full px-3.5 pt-6 sm:px-6 sm:pt-[30px]"><Alert type="error" showIcon title="Attendance data could not be loaded." /></div>;

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredMembers = normalizedQuery
    ? report.members.filter((member) => [member.display_name, member.username, member.character_name].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)))
    : report.members;
  const members = sortAttendanceMembers(filteredMembers, sort, report.attendance_days.length);
  const attendanceDays = new Set(report.attendance_days);
  const monthly = getAttendanceSummary(report);
  const latest = getLatestAttendanceSummary(report);
  const days = Array.from({ length: report.days_in_month }, (_, index) => index + 1);

  return (
    <DashboardPage description={personal ? "Your monthly attendance statistics from completed sessions." : "Monthly attendance records for all members."} eyebrow={personal ? "Personal records" : "Member records"} title={personal ? "My Attendance" : "Attendance Recap"}>

      <section className={`mt-[30px] grid gap-3 sm:grid-cols-2 ${personal ? "" : "xl:grid-cols-4"}`}>
        <AttendanceMetric label="Total attendance" numerator={monthly.eligible} denominator={monthly.total} />
        <AttendanceMetric label="Attendance rate" rate={monthly.rate} />
        {!personal ? <AttendanceMetric label="Latest total attendance" numerator={latest.eligible} denominator={latest.total} /> : null}
        {!personal ? <AttendanceMetric label="Latest attendance rate" rate={latest.rate} /> : null}
      </section>

      <section className="mt-4 border border-[var(--color-border)] bg-[rgba(255,255,255,.012)]">
        <div className="flex flex-col items-start gap-2 border-b border-[var(--color-border)] px-4 py-3 text-sm sm:flex-row sm:items-center sm:gap-3"><span className="flex items-center gap-3"><i className="h-2 w-2 shrink-0 rounded-full bg-[#55dfbd] shadow-[0_0_10px_rgba(85,223,189,.5)]" /><strong className="whitespace-nowrap uppercase">Attendance summary by date</strong></span><span className="whitespace-nowrap rounded-full bg-[rgba(255,255,255,.04)] px-2 py-1 text-xs text-[var(--color-foreground-muted)]">{report.attendance_days.length} attendance days</span></div>
        {error ? <Alert className="m-3" type="error" showIcon title="Could not load selected month." /> : null}
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          {!personal ? <><label className="sr-only" htmlFor="attendance-search">Search members</label><input className="h-10 min-w-[220px] flex-1 border border-[var(--color-border)] bg-[rgba(255,255,255,.015)] px-3 text-base text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-primary-muted)]" id="attendance-search" onChange={(event) => setQuery(event.target.value)} placeholder="Search members..." type="search" value={query} /><OptionDropdown ariaLabel="Sort attendance" className="min-w-[176px]" onChange={(value) => setSort(value as AttendanceSort)} options={[{ label: "Default order", value: "default" }, { label: "Total: highest", value: "total-desc" }, { label: "Total: lowest", value: "total-asc" }, { label: "%: highest", value: "percentage-desc" }, { label: "%: lowest", value: "percentage-asc" }, { label: "Playtime: highest", value: "playtime-desc" }, { label: "Playtime: lowest", value: "playtime-asc" }]} value={sort} /></> : null}
          <div className="ml-auto flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:opacity-40" disabled={loading} onClick={() => void changeMonth(-1)} type="button" aria-label="Previous month">‹</button>
            <strong className="min-w-[110px] text-center text-sm tracking-[.08em] uppercase">{formatMonth(report.month)}</strong>
            <button className="grid h-9 w-9 place-items-center border border-[var(--color-border)] text-[var(--color-primary)] disabled:opacity-40" disabled={loading} onClick={() => void changeMonth(1)} type="button" aria-label="Next month">›</button>
          </div>
        </div>

        <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-45" : "opacity-100"}`} aria-busy={loading}>
          <div className="min-w-max">
            <div className="grid grid-cols-[240px_repeat(var(--days),38px)_100px_70px_64px] border-b border-[var(--color-border)] text-xs font-black tracking-[.1em] text-[var(--color-primary-muted)] uppercase" style={{ "--days": report.days_in_month } as React.CSSProperties}>
              <span className="bg-[var(--color-background-soft)] px-3 py-2.5 md:sticky md:left-0 md:z-20">Character Name</span>{days.map((day) => <span className="grid place-items-center" key={day}>{day}</span>)}<span className="grid place-items-center bg-[var(--color-background-soft)] md:sticky md:right-[134px] md:z-20 md:shadow-[-8px_0_12px_rgba(0,0,0,.2)]">Playtime</span><span className="grid place-items-center bg-[var(--color-background-soft)] md:sticky md:right-16 md:z-20">Total</span><span className="grid place-items-center bg-[var(--color-background-soft)] md:sticky md:right-0 md:z-20">%</span>
            </div>
            {members.map((member) => {
              const records = new Map(member.records.map((record) => [record.date, record]));
              const memberRate = report.attendance_days.length === 0 ? 0 : Math.round((member.total_attended / report.attendance_days.length) * 100);
              return <div className="grid min-h-[52px] grid-cols-[240px_repeat(var(--days),38px)_100px_70px_64px] border-b border-[rgba(217,169,80,.1)] text-sm last:border-b-0" style={{ "--days": report.days_in_month } as React.CSSProperties} key={member.member_id}>
                <div className="flex items-center gap-2.5 bg-[var(--color-background-soft)] px-3 py-2 md:sticky md:left-0 md:z-10"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgba(242,182,61,.16)] text-xs font-black text-[var(--color-primary-bright)]">{initials(member.character_name || member.username)}</span><span className="min-w-0"><strong className="block overflow-hidden text-ellipsis whitespace-nowrap">{member.character_name || "-"}</strong><span className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[var(--color-foreground-muted)]">@{member.username}</span></span></div>
                {days.map((day) => {
                  const date = `${report.month}-${String(day).padStart(2, "0")}`;
                  const record = records.get(date);
                  const knownDay = attendanceDays.has(date);
                  return <span className="grid place-items-center" title={record ? `${formatDuration(record.playtime_seconds)} playtime` : undefined} key={date}>{record?.is_attended ? <i className="grid h-6 w-6 place-items-center rounded-md bg-[rgba(42,211,169,.16)] not-italic text-[#55dfbd]">✓</i> : knownDay ? <i className="not-italic text-[var(--color-foreground-muted)]">—</i> : <i className="not-italic text-[rgba(185,172,145,.2)]">·</i>}</span>;
                })}
                <strong className="grid place-items-center bg-[var(--color-background-soft)] text-[var(--color-foreground)] md:sticky md:right-[134px] md:z-10 md:shadow-[-8px_0_12px_rgba(0,0,0,.2)]">{formatDuration(getMemberTotalPlaytime(member))}</strong><strong className="grid place-items-center bg-[var(--color-background-soft)] text-[var(--color-primary-bright)] md:sticky md:right-16 md:z-10">{member.total_attended}</strong><strong className="grid place-items-center bg-[var(--color-background-soft)] text-[var(--color-foreground-muted)] md:sticky md:right-0 md:z-10">{memberRate}%</strong>
              </div>;
            })}
            {!members.length ? <div className="grid min-h-[120px] place-items-center text-sm text-[var(--color-foreground-muted)]">No matching members found.</div> : null}
          </div>
        </div>
      </section>
    </DashboardPage>
  );
}

function AttendanceMetric({ denominator, label, numerator, rate }: { denominator?: number; label: string; numerator?: number; rate?: number }) {
  return <article className="border border-[var(--color-border)] bg-[rgba(242,182,61,.04)] px-5 py-4"><p className="text-xs font-black tracking-[.18em] text-[var(--color-primary-muted)] uppercase">{label}</p><strong className={`mt-2 block font-[Impact] text-3xl font-normal ${rate === undefined ? "text-[var(--color-foreground)]" : "text-[#55dfbd]"}`}>{rate === undefined ? <>{numerator} <span className="text-lg text-[var(--color-foreground-muted)]">/ {denominator}</span></> : `${rate.toFixed(1)}%`}</strong></article>;
}

function shiftMonth(month: string, offset: number) {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}

function formatMonth(month: string) {
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
