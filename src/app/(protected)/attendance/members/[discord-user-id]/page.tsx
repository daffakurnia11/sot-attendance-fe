import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MemberRecordsView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { selectMemberAttendance } from "@/lib/member-attendance";
import { loadAttendance } from "@/services/attendance/attendance.service.server";
import { loadMemberRecords } from "@/services/member-records/member-records.service.server";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "Member records" };

export default async function MemberRecordsPage({ params }: { params: Promise<{ "discord-user-id": string }> }) {
  const { "discord-user-id": discordUserID } = await params;
  if (!/^\d{1,20}$/.test(discordUserID)) notFound();
  const [records, roster, settings] = await Promise.all([
    loadMemberRecords(discordUserID),
    loadAttendance(),
    loadSettings(),
  ]);
  const attendance = roster ? selectMemberAttendance(roster, discordUserID) : null;
  if (attendance && !attendance.members.length) notFound();
  const member = attendance?.members[0];
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
  return (
    <DashboardPage
      description={member?.username ?? "Attendance history"}
      eyebrow="Member records"
      title={member?.character_name || "Member records"}
    >
      <MemberRecordsView
        key={discordUserID}
        data={records}
        initialAttendance={attendance}
        minimumAttendance={settings ? Number(settings.attendance_minimum) : null}
        maximumAttendance={settings ? Number(settings.attendance_maximum) : null}
        today={today}
        discordUserID={discordUserID}
      />
    </DashboardPage>
  );
}
