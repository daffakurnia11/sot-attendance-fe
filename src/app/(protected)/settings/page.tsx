import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsView } from "@/components/organisms";
import { DashboardPage } from "@/components/templates";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  if (!(await isAdminSession())) redirect(routes.dashboard);

  const settings = await loadSettings();
  return (
    <DashboardPage description="Adjust system configuration." eyebrow="Account and system" title="Settings">
      <SettingsView initialData={settings} />
    </DashboardPage>
  );
}
