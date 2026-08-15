import type { Metadata } from "next";

import { MemberRecordsView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { loadMemberRecords } from "@/services/member-records/member-records.service.server";

export const metadata: Metadata = { title: "My Records" };

export default async function MyRecordsPage() {
  const records = await loadMemberRecords();

  return (
    <DashboardPage description="Your FiveM activity and attendance history." eyebrow="Personal records" title="My Records">
      <MemberRecordsView data={records} />
    </DashboardPage>
  );
}
