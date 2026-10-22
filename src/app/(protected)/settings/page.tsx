import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";

export default async function SettingsPage() {
  if (!(await isAdminSession())) redirect(routes.dashboard);
  redirect(routes.attendanceSettings);
}
