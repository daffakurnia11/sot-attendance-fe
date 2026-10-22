import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsView } from "@/components/organisms/settings";
import { DashboardPage } from "@/components/templates";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadSafeboxStock } from "@/services/safebox-stock/safebox-stock.service.server";
import { loadSettings } from "@/services/settings/settings.service.server";

export const metadata: Metadata = { title: "Safebox stock settings" };
export default async function SettingsPage() {
  if (!(await isAdminSession())) redirect(routes.dashboard);
  const [settings, stock] = await Promise.all([loadSettings(), loadSafeboxStock(routes.safeboxSettings)]);
  return (
    <DashboardPage
      title="Safebox stock settings"
      eyebrow="Account and system"
      description="Adjust system configuration."
    >
      <SettingsView section="safebox-stock" initialData={settings} safeboxStock={stock} />
    </DashboardPage>
  );
}
