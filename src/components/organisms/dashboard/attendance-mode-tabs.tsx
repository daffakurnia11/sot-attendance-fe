import { RouteTabs } from "@/components/atoms";
import { routes } from "@/config/routes";
export type AttendanceMode = "recap" | "calendar";
export function AttendanceModeTabs({ active }: Readonly<{ active: AttendanceMode }>) {
  return (
    <RouteTabs
      label="Attendance view"
      active={active}
      items={[
        {
          key: "recap",
          label: "Attendance Recap",
          note: "Roster totals and playtime",
          href: routes.attendanceTabs.recap,
        },
        {
          key: "calendar",
          label: "Attendance Calendar",
          note: "Daily turnout and status",
          href: routes.attendanceTabs.calendar,
        },
      ]}
    />
  );
}
