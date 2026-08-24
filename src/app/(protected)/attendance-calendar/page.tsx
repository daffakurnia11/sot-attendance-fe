import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default async function AttendanceCalendarPage() {
  redirect(`${routes.attendance}?view=calendar`);
}
