import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsView } from "@/components/organisms/settings";
import { DashboardPage } from "@/components/templates";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "Money settings" };
export default async function SettingsPage() {
  if (!(await isAdminSession())) redirect(routes.dashboard);
  const settings = await loadSettings();
  return (
    <DashboardPage title="Money settings" eyebrow="Account and system" description="Adjust system configuration.">
      <SettingsView section="money" initialData={settings} safeboxStock={null} />
    </DashboardPage>
  );
}
