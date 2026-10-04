import type { Metadata } from "next";

import { MemberRecordsView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { loadAttendance } from "@/services/attendance/attendance.service.server";
import { loadMemberRecords } from "@/services/member-records/member-records.service.server";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "My Records" };

export default async function MyRecordsPage() {
  const [records, attendance, settings] = await Promise.all([
    loadMemberRecords(),
    loadAttendance(true),
    loadSettings(),
  ]);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

  return (
    <DashboardPage
      description="Your FiveM activity and attendance history."
      eyebrow="Personal records"
      title="My Records"
    >
      <MemberRecordsView
        data={records}
        initialAttendance={attendance}
        minimumAttendance={settings ? Number(settings.attendance_minimum) : null}
        maximumAttendance={settings ? Number(settings.attendance_maximum) : null}
        today={today}
      />
    </DashboardPage>
  );
}
