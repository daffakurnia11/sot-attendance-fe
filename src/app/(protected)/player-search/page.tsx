import type { Metadata } from "next";

import { PlayerSearchView } from "@/components/organisms";
import { loadDashboard } from "@/services/dashboard/dashboard.service.server";

export const metadata: Metadata = { title: "Player Search" };

export default async function PlayerSearchPage() {
  return <PlayerSearchView initialData={await loadDashboard()} />;
}
