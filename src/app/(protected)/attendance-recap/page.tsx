import { redirect } from "next/navigation";

import { routes } from "@/config/routes";

export default async function AttendanceRecapPage() {
  redirect(`${routes.attendance}?view=recap`);
}
