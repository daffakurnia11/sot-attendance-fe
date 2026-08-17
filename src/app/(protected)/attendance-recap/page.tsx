import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AttendanceView } from "@/components/organisms";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadAttendance } from "@/services/attendance/attendance.service.server";

export const metadata: Metadata = { title: "Attendance Recap" };

export default async function AttendanceRecapPage() {
  // Roster-wide report: hiding the menu is not a control, so the page
  // itself turns non-admins away. The Go API rejects the request too.
  if (!(await isAdminSession())) redirect(routes.dashboard);

  return <AttendanceView initialData={await loadAttendance()} />;
}
