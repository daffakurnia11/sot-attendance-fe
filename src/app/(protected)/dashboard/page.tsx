import type { Metadata } from "next";

import { DashboardView } from "@/components/organisms";
import { DashboardPage as DashboardPageLayout } from "@/components/templates";
import { loadAttendance } from "@/services/attendance/attendance.service.server";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";
import { loadMemberRecords } from "@/services/member-records/member-records.service.server";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [data, records, attendance, settings] = await Promise.all([
    loadDashboard(),
    loadMemberRecords(),
    loadAttendance(true),
    loadSettings(),
  ]);

  return (
    <DashboardPageLayout
      description="Attendance and FiveM activity summary."
      eyebrow="Member overview"
      title="Dashboard"
    >
      <DashboardView
        data={data}
        statistics={{
          data: records,
          initialAttendance: attendance,
          minimumAttendance: settings ? Number(settings.attendance_minimum) : null,
          maximumAttendance: settings ? Number(settings.attendance_maximum) : null,
        }}
      />
    </DashboardPageLayout>
  );
}
