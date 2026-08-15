import type { Metadata } from "next";

import { auth } from "@/auth";
import { SettingsView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [session, settings] = await Promise.all([auth(), loadSettings()]);
  return <DashboardPage description="Adjust your profile and system configuration." eyebrow="Account and system" title="Settings"><SettingsView initialCharacterName={session?.user?.member?.character_name ?? ""} initialData={settings} /></DashboardPage>;
}
