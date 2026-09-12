import "server-only";

import { loadForMember } from "@/lib/session.server";

import { fetchDashboard } from "./dashboard-api";

export function loadDashboard() {
  return loadForMember("/dashboard", fetchDashboard);
}
