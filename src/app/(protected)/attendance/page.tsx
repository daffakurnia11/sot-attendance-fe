import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AttendanceCalendarView, type AttendanceMode, AttendanceView } from "@/components/organisms";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadAttendance } from "@/services/attendance/attendance.service.server";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "Attendance" };

const DEFAULT_PLAYER_THRESHOLD = 15;

export default async function AttendancePage({ searchParams }: Readonly<{ searchParams: Promise<{ view?: string }> }>) {
  if (!(await isAdminSession())) redirect(routes.dashboard);

  const requestedView = (await searchParams).view;
  const view: AttendanceMode = requestedView === "calendar" ? "calendar" : "recap";
  const report = await loadAttendance();

  if (view === "recap") return <AttendanceView combined initialData={report} />;

  // Keep the remote database reads sequential. Running both together can push
  // attendance past its request deadline when the database tunnel is slow.
  const settings = report ? await loadSettings() : null;
  const parsedThreshold = Number(settings?.player_threshold);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
  return (
    <AttendanceCalendarView
      combined
      initialData={report}
      playerThreshold={
        Number.isFinite(parsedThreshold) && parsedThreshold >= 0 ? parsedThreshold : DEFAULT_PLAYER_THRESHOLD
      }
      today={today}
    />
  );
}
