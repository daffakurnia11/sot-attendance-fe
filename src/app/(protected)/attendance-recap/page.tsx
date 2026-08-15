import type { Metadata } from "next";

import { AttendanceView } from "@/components/organisms";
import { loadAttendance } from "@/services/attendance/attendance.service.server";

export const metadata: Metadata = { title: "Attendance Recap" };

export default async function AttendanceRecapPage() {
  return <AttendanceView initialData={await loadAttendance()} />;
}
