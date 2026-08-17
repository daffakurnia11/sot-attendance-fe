import type { Metadata } from "next";

import { AttendanceCalendarView } from "@/components/organisms";
import { loadAttendance } from "@/services/attendance/attendance.service.server";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "Attendance Calendar" };

// Fallback matches the settings table default. Settings load independently of
// attendance, so a settings failure degrades the thresholds rather than the page.
const DEFAULT_PLAYER_THRESHOLD = 15;

export default async function AttendanceCalendarPage() {
  const [report, settings] = await Promise.all([loadAttendance(), loadSettings()]);
  const parsed = Number(settings?.player_threshold);
  // en-CA renders ISO, and the zone is fixed so the "upcoming" boundary matches
  // the attendance window rather than the viewer's device clock.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

  return (
    <AttendanceCalendarView
      initialData={report}
      playerThreshold={Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_PLAYER_THRESHOLD}
      today={today}
    />
  );
}
