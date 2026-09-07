import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PlayerSearchView } from "@/components/organisms";
import { routes } from "@/config/routes";
import { isAdminSession } from "@/lib/session.server";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "Player Search" };

export default async function PlayerSearchPage() {
  if (!(await isAdminSession())) redirect(routes.dashboard);

  return <PlayerSearchView initialData={await loadDashboard()} />;
}
