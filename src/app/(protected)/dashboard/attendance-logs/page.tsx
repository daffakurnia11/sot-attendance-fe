import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default async function AttendanceLogsPage() {
  redirect(routes.attendanceRecap);
}
