import type { Metadata } from "next";

import { auth } from "@/auth";
import { SettingsView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { loadMemberProfile } from "@/services/member-profile/member-profile.service.server";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [session, profile, settings] = await Promise.all([auth(), loadMemberProfile(), loadSettings()]);
  return (
    <DashboardPage
      description="Adjust your profile and system configuration."
      eyebrow="Account and system"
      title="Settings"
    >
      <SettingsView
        initialCharacterName={profile?.character_name ?? session?.user?.member?.character_name ?? ""}
        initialCFXName={profile?.cfx_name ?? session?.user?.member?.cfx_name ?? ""}
        initialData={settings}
      />
    </DashboardPage>
  );
}
